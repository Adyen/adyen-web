import type { PaymentData } from '@adyen/adyen-web';

export default async function makePaymentsCall(
    data: PaymentData,
    countryCode: string,
    shopperLocale: string,
    amount: { value: number; currency: string }
) {
    const payload = {
        ...paymentsConfig,
        ...data,
        countryCode,
        shopperLocale,
        amount,
        channel: 'Web'
    };

    return await $fetch('/api/payments', {
        method: 'post',
        body: payload
    });
}
