export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.FREEPAY_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Missing FREEPAY_API_KEY' });
        }

        const upstream = await fetch('https://api.freepay.com.br/v1/pix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                amount: req.body.amount,
                description: req.body.description,
                external_id: req.body.external_id,

                customer: {
                    name: req.body.name,
                    email: req.body.email,
                    document: req.body.document
                },

                callback_url: `${process.env.PUBLIC_BASE_URL}/api/freepay-webhook`
            })
        });

        const data = await upstream.json();

        // 🔥 NORMALIZAÇÃO (ESSENCIAL)
        return res.status(200).json({
            transactionId: data.id,
            pixCode: data.pix_code,
            pixQrCode: data.qr_code,
            status: data.status
        });

    } catch (err) {
        return res.status(500).json({ error: String(err) });
    }
}