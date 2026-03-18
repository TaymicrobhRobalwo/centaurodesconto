export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    try {
        const tx = req.body;

        const statusRaw = String(tx.status || "").toLowerCase();

        let status = "waiting_payment";

        if (["paid", "confirmed", "approved"].includes(statusRaw)) {
            status = "paid";
        } else if (["cancelled", "expired"].includes(statusRaw)) {
            status = "cancelled";
        }

        const orderId = tx.external_id || tx.id;

        const payload = {
            orderId,
            platform: "Freepay",
            paymentMethod: "pix",
            status,
            createdAt: new Date().toISOString(),
            approvedDate: status === "paid" ? new Date().toISOString() : null,
            customer: {
                name: tx.customer?.name || "Cliente",
                email: tx.customer?.email || "",
                phone: tx.customer?.phone || null,
                document: tx.customer?.document || null,
                country: "BR"
            },
            products: [{
                id: "produto",
                name: "Produto",
                quantity: 1,
                priceInCents: tx.amount * 100
            }],
            commission: {
                totalPriceInCents: tx.amount * 100,
                currency: "BRL"
            }
        };

        await fetch(`${process.env.PUBLIC_BASE_URL}/api/utmify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        return res.status(200).json({ error: true });
    }
}