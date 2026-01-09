const { CHECKOUT_API_KEY } = require('../utils/config');
const handleCallback = require('../utils/handleCallback');

module.exports = async (req, res) => {
    try {
        console.warn('\n### PATCHING SESSION');
        const sessionId = req.params.sessionId;

        if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(sessionId)) {
            return res.status(400).json({ error: 'Invalid sessionId' });
        }

        const body = JSON.stringify(req.body);

        const url = new URL(`https://checkout-test.adyen.com/checkout/v72/sessions/${encodeURIComponent(sessionId)}`);

        const fetchResponse = await fetch(url, {
            method: 'PATCH',
            body,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body, 'utf8'),
                'X-Api-Key': CHECKOUT_API_KEY
            }
        });

        handleCallback(fetchResponse, res);
    } catch (error) {
        console.error('Error patching checkout session:', error);
        res.status(500).json({ error: 'Failed to patch checkout session' });
    }
};
