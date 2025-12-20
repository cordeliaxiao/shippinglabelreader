// Vercel Serverless Function - API Key 安全存储在环境变量中
export default async function handler(req, res) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 从环境变量读取 API Key（安全！不会暴露给前端）
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key 未配置，请在 Vercel 环境变量中设置 GEMINI_API_KEY' });
    }

    try {
        const { image, mimeType } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const prompt = `Analyze this USPS shipping label image carefully. Extract the RECIPIENT address (the large text in center, NOT the small sender/return address).

For each label, extract:
- name: Recipient full name
- address: Full street address (including apt/unit)
- city: City name
- state: 2-letter state code (e.g., CA, FL, TX)
- zip: Full ZIP code (5 or 9 digits, no dashes)
- tracking: USPS tracking number (remove all spaces, just digits)
- date: Ship date if visible (format: MM/DD/YY)

IMPORTANT:
- Tracking numbers should have NO SPACES (e.g., "9300120762600011968566" not "9300 1207 6260...")
- State must be exactly 2 letters
- ZIP should be complete (5 or 9 digits)

Return ONLY a JSON array, no markdown, no explanation:
[{"name":"","address":"","city":"","state":"XX","zip":"","tracking":"","date":""}]

If multiple labels, return all. If none found, return []`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { inline_data: { mime_type: mimeType || 'image/png', data: image } },
                            { text: prompt }
                        ]
                    }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errMsg = errorData.error?.message || `Gemini API error (${response.status})`;
            return res.status(response.status).json({ error: errMsg });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

        // 解析 JSON
        let jsonStr = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            const arrayMatch = text.match(/\[[\s\S]*\]/);
            if (arrayMatch) jsonStr = arrayMatch[0];
        }

        try {
            const addresses = JSON.parse(jsonStr.trim());
            return res.status(200).json({
                success: true,
                addresses: addresses.map(a => ({
                    name: a.name || '',
                    address: a.address || '',
                    city: a.city || '',
                    state: (a.state || '').toUpperCase().substring(0, 2),
                    zip: (a.zip || '').replace(/-/g, ''),
                    tracking: (a.tracking || '').replace(/\s/g, ''),
                    date: a.date || ''
                }))
            });
        } catch (parseError) {
            return res.status(200).json({ success: true, addresses: [], raw: text });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
