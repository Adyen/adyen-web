export default defineEventHandler(async event => {
    const body = await readBody(event);
    const config = useRuntimeConfig(event);
    const payload = {
        ...body,
        merchantAccount: config.merchantAccount
    };

    const response = await fetch(`https://checkout-test.adyen.com/${config.apiVersion}/payments/details`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'X-Api-Key': config.checkoutApiKey
        }
    });

    return await response.json();
});
