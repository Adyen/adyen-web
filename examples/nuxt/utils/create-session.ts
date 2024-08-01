export default async function createSession(countryCode: string, shopperLocale: string, amount: { value: number; currency: string }) {
    const payload = {
        amount,
        countryCode,
        shopperLocale,
        channel: 'Web',
        shopperReference: paymentsConfig.reference,
        lineItems: paymentsConfig.lineItems,
        reference: paymentsConfig.reference,
        returnUrl: paymentsConfig.returnUrl,
        shopperEmail: paymentsConfig.shopperEmail
    };

    const response = await $fetch('/api/session', {
        method: 'post',
        body: payload
    });

    return response;
}
