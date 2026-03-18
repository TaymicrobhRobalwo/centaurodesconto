export default async function handler(req, res) {
    try {
        const publicKey = process.env.FREEPAY_PUBLIC_KEY;
        const secretKey = process.env.FREEPAY_SECRET_KEY;

        if (!publicKey || !secretKey) {
            return res.status(500).json({ error: 'Missing credentials' });
        }

        const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

        // 🔥 GARANTIR QUE req.body EXISTE
        const body = req.body || {};

        const payload = {
            request: {
                amount: Math.round(Number(body.amount) * 100),

                paymentMethod: "PIX",

                metadata: {
                    orderId: body.external_id || `pedido_${Date.now()}`
                },

                customer: {
                    name: body.name,
                    email: body.email,

                    document: {
                        number: String(body.document || "").replace(/\D/g, ""),
                        type: "cpf"
                    },

                    phone: String(body.phone || "").replace(/\D/g, "")
                },

                items: [
                    {
                        title: body.description || "Produto",
                        quantity: 1,
                        unitPrice: Math.round(Number(body.amount) * 100)
                    }
                ],

                externalId: body.external_id,

                postbackUrl: `${process.env.PUBLIC_BASE_URL}/api/freepay-webhook`
            }
        };

        const response = await fetch('https://api.freepaybrasil.com/v1/payment-transaction/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Basic ${auth}`
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
            return res.status(500).json({ raw: text });
        }

        const tx = data.data || data;

        if (!tx?.id) {
            return res.status(500).json({
                error: "Erro ao criar transação",
                debug: data
            });
        }

        return res.status(200).json({
            transactionId: tx.id,
            pixCode: tx.pix?.code,
            pixQrCode: tx.pix?.qrCode,
            status: tx.status
        });

    } catch (err) {
        console.error("ERRO CRÍTICO:", err);

        return res.status(500).json({
            raw: "FUNCTION_ERROR",
            error: String(err)
        });
    }
}