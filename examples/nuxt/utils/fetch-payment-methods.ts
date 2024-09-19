export default async function fetchPaymentMethods(countryCode: string, shopperLocale: string, amount: { value: number; currency: string }) {
    const payload = {
        amount,
        countryCode,
        shopperLocale,
        channel: 'Web',
        shopperReference: paymentsConfig.reference,
        lineItems: paymentsConfig.lineItems,
        reference: paymentsConfig.reference,
        shopperEmail: paymentsConfig.shopperEmail
    };

    return await $fetch('/api/paymentMethods', {
        method: 'post',
        body: payload
    });
}
