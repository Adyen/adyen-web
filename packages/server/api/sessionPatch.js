const { CHECKOUT_API_KEY } = require('../utils/config');
const handleCallback = require('../utils/handleCallback');

module.exports = async (req, res) => {
    try {
        console.warn('\n### PATCHING SESSION');
        const sessionId = req.params.sessionId;
        const body = JSON.stringify(req.body);

        const fetchResponse = await fetch(`https://checkout-test.adyen.com/checkout/v72/sessions/${sessionId}`, {
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
