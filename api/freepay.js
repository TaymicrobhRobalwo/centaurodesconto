export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.FREEPAY_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Missing FREEPAY_API_KEY' });
        }

        const payload = {
            amount: Number(req.body.amount), // geralmente em reais
            paymentMethod: "PIX",

            customer: {
                name: req.body.name,
                email: req.body.email,
                document: req.body.document
            },

            items: [
                {
                    title: req.body.description || "Produto",
                    quantity: 1,
                    unitPrice: Number(req.body.amount)
                }
            ],

            externalId: req.body.external_id,

            postbackUrl: `${process.env.PUBLIC_BASE_URL}/api/freepay-webhook`
        };

        const response = await fetch('https://api.freepaybrasil.com/v1/payment-transaction/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey // ⚠️ MUITOS gateways NÃO usam Bearer
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();

        console.log("STATUS FREEPAY:", response.status);
        console.log("RESPOSTA FREEPAY:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return res.status(500).json({
                error: "Resposta inválida da Freepay",
                raw: text
            });
        }

        // 🔥 NORMALIZAÇÃO PRO SEU CHECKOUT
        return res.status(200).json({
            transactionId: data.id || data.transactionId,
            pixCode: data.pixCode || data.pix_code,
            pixQrCode: data.pixQrCode || data.qrCode || data.qr_code,
            status: data.status
        });

    } catch (err) {
        console.error("ERRO FREEPAY:", err);

        return res.status(500).json({
            error: String(err),
            details: "Falha ao conectar com a Freepay"
        });
    }
}