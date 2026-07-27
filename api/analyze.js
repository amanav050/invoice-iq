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

  const systemPrompt = 'You are a GST compliance AI for Indian businesses. Respond ONLY in valid JSON. No markdown. No explanation outside JSON. No code fences.';

  let userPrompt;
  let maxTokens;

  if (type === 'invoice') {
    userPrompt = `Analyze this Indian GST invoice for compliance issues.
Invoice: ${data.invoiceNumber}, Vendor: ${data.vendorName}, Amount: ₹${data.amount}, HSN: ${data.hsnCode}, GST Rate: ${data.gstRate}%, Date: ${data.date}, Vendor Filing Status: ${data.vendorFilingStatus || 'Unknown'}
Return JSON with keys: complianceScore (0-100), hsnValidation {current, correct, isValid, reason}, itcEligibility {status (eligible|at-risk|blocked), reason}, taxRateCheck {applied, correct, isValid}, recommendation (1-2 lines)`;
    maxTokens = 512;
  } else if (type === 'vendor') {
    userPrompt = `Assess risk for this Indian GST vendor.
Vendor: ${data.name}, GSTIN: ${data.gstin}, Reliability: ${data.reliability}/100, Filing Status: ${data.filingStatus}, Invoices: ${data.invoiceCount}, Known Risk: ${data.riskNote}
Return JSON with keys: riskNarrative (2-3 lines), filingPattern (1 line), itcExposure (amount string in ₹), prediction (1 line), recommendation (1-2 lines)`;
    maxTokens = 384;
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

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
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: 'Empty AI response' });
    }

    // Strip any accidental markdown fences
    const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Analysis error:', err.message);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}