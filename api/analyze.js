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

  let userPrompt;

  if (type === 'invoice') {
    userPrompt = `Analyze this GST invoice. Vendor:${data.vendorName} Amount:₹${data.amount} HSN:${data.hsnCode} AppliedGST:${data.gstRate}% VendorFilingStatus:${data.vendorFilingStatus}.
Return ONLY this JSON structure, nothing else:
{"complianceScore":0,"hsnValidation":{"current":"","correct":"","isValid":true,"reason":""},"itcEligibility":{"status":"eligible","reason":""},"taxRateCheck":{"applied":0,"correct":0,"isValid":true},"recommendation":""}
Fill in real values. complianceScore 0-100. itcEligibility.status must be "eligible","at-risk", or "blocked". Keep all strings under 100 chars.`;
  } else if (type === 'vendor') {
    userPrompt = `Assess this GST vendor. Name:${data.name} GSTIN:${data.gstin} Reliability:${data.reliability}/100 FilingStatus:${data.filingStatus} Invoices:${data.invoiceCount} Risk:${data.riskNote}.
Return ONLY this JSON structure, nothing else:
{"riskNarrative":"","filingPattern":"","itcExposure":"₹0","prediction":"","recommendation":""}
Fill in real values. Keep all strings under 100 chars.`;
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
          model: 'qwen/qwen3-32b',
          messages: [
            {
              role: 'system',
              content: 'You are a GST compliance AI. Return ONLY valid JSON. No thinking. No markdown. No explanation. No code fences. Just the JSON object.',
            },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.1,
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
        const errText = await response.text();
        console.error('Groq error:', response.status, errText);
        return res.status(502).json({ error: 'AI service error' });
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        console.error('Empty response:', JSON.stringify(result).slice(0, 300));
        return res.status(502).json({ error: 'Empty response' });
      }

      // Extract JSON — find first { and last }
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        console.error('No JSON found:', content.slice(0, 200));
        return res.status(500).json({ error: 'No JSON in response' });
      }

      const jsonStr = content.slice(firstBrace, lastBrace + 1);

      try {
        const parsed = JSON.parse(jsonStr);
        return res.status(200).json(parsed);
      } catch (e) {
        console.error('JSON parse failed:', jsonStr.slice(0, 200));
        return res.status(500).json({ error: 'Invalid JSON' });
      }

    } catch (err) {
      console.error('Network error:', err.message);
      if (attempt === maxRetries) {
        return res.status(500).json({ error: 'Network error' });
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}