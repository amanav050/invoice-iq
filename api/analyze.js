export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { type, data } = req.body;
  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data' });
  }

  const systemPrompt = 'You are a GST compliance AI. Return ONLY valid JSON. No markdown. No code fences. Keep all string values under 120 characters.';

  let userPrompt;

  if (type === 'invoice') {
    userPrompt = `Check this GST invoice. Invoice:${data.invoiceNumber} Vendor:${data.vendorName} Amt:${data.amount} HSN:${data.hsnCode} Rate:${data.gstRate}% VendorStatus:${data.vendorFilingStatus}
JSON keys: complianceScore(0-100), hsnValidation{current,correct,isValid,reason}, itcEligibility{status("eligible"/"at-risk"/"blocked"),reason}, taxRateCheck{applied,correct,isValid}, recommendation`;
  } else if (type === 'vendor') {
    userPrompt = `Assess GST vendor risk. Name:${data.name} GSTIN:${data.gstin} Reliability:${data.reliability}/100 Filing:${data.filingStatus} Invoices:${data.invoiceCount} Risk:${data.riskNote}
JSON keys: riskNarrative, filingPattern, itcExposure(₹ string), prediction, recommendation`;
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.2,
        }),
      });

      if (response.status === 429) {
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        return res.status(429).json({ error: 'Rate limited' });
      }

      if (!response.ok) {
        return res.status(502).json({ error: 'AI service error' });
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        return res.status(502).json({ error: 'Empty response' });
      }

      let cleaned = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      // Try to repair truncated JSON
      try {
        const parsed = JSON.parse(cleaned);
        return res.status(200).json(parsed);
      } catch {
        // Attempt repair — close open strings and braces
        let repaired = cleaned;

        // Count open braces/brackets
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/]/g) || []).length;

        // If we're inside an unterminated string, close it
        const lastQuote = repaired.lastIndexOf('"');
        const afterLastQuote = repaired.slice(lastQuote + 1);
        if (lastQuote > 0 && !afterLastQuote.includes('"') && afterLastQuote.length < 5) {
          repaired = repaired.slice(0, lastQuote + 1);
          // Check if we need a value after a colon
          const beforeQuote = repaired.slice(0, lastQuote);
          const lastColon = beforeQuote.lastIndexOf(':');
          const lastComma = beforeQuote.lastIndexOf(',');
          if (lastColon > lastComma) {
            // We're in a key without value, remove the incomplete key-value
            repaired = repaired.slice(0, lastComma > 0 ? lastComma : lastColon);
          }
        }

        // Close brackets and braces
        for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

        try {
          const parsed = JSON.parse(repaired);
          return res.status(200).json(parsed);
        } catch {
          console.error('JSON repair failed:', cleaned.slice(0, 200));
          return res.status(500).json({ error: 'Invalid response format' });
        }
      }

    } catch (err) {
      if (attempt === maxRetries) {
        console.error('Network error:', err.message);
        return res.status(500).json({ error: 'Network error' });
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}