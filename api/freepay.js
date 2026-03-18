export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const publicKey = process.env.FREEPAY_PUBLIC_KEY;
        const secretKey = process.env.FREEPAY_SECRET_KEY;

        if (!publicKey || !secretKey) {
            return res.status(500).json({ error: 'Missing Freepay credentials' });
        }

        // 🔐 AUTH CORRETA
        const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

        const payload = {
            amount: Number(req.body.amount),
            paymentMethod: "PIX",

            metadata: {
                orderId: req.body.external_id || "pedido_" + Date.now()
            },

            customer: {
                name: req.body.name,
                email: req.body.email,
                document: req.body.document,
                phone: (req.body.phone || "31999999999").replace(/\D/g, "") // ⚠️ obrigatório
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
        return res.status(500).json({
            error: "Resposta inválida da Freepay",
            raw: text
        });
    }

    // 🔥 ADAPTAÇÃO PRO SEU CHECKOUT (CRÍTICO)
    const tx = data.data || data;

    if (!tx?.id) {
        console.error("RESPOSTA INESPERADA FREEPAY:", data);

        return res.status(500).json({
            error: "Não foi possível obter o ID da transação",
            debug: data
        });
    }

    return res.status(200).json({
        transactionId: tx.id,
        pixCode: tx.pix?.code || tx.pixCode,
        pixQrCode: tx.pix?.qrCode || tx.qrCode,
        status: tx.status
    });

} catch (err) {
    console.error("ERRO FREEPAY:", err);

    return res.status(500).json({
        error: String(err)
    });
}
}