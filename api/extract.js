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

    // 从环境变量读取 API Key（安全！）
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    try {
        const { image, mimeType } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const prompt = `Analyze this shipping label and extract the RECIPIENT address (NOT sender/return address).

Extract these fields:
- name: Recipient full name
- address: Street address with apt/unit
- city: City name
- state: 2-letter state code (CA, TX, NY, etc.)
- zip: ZIP code (5 or 9 digit)
- tracking: Tracking number if visible

Return ONLY a JSON array, no markdown, no explanation:
[{"name":"...","address":"...","city":"...","state":"XX","zip":"...","tracking":"..."}]

If multiple labels visible, return all. If none found, return []`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
            const errorData = await response.json();
            return res.status(response.status).json({ 
                error: errorData.error?.message || 'Gemini API error' 
            });
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
                    state: (a.state || '').toUpperCase(),
                    zip: a.zip || '',
                    tracking: a.tracking || ''
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
