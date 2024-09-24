<script lang="ts">
import { DEFAULT_AMOUNT } from '~/constants';
import { AdyenCheckout, Dropin } from '@adyen/adyen-web/auto';
import type { AdyenCheckoutError, CoreConfiguration, PaymentCompletedData, PaymentFailedData, UIElement } from '@adyen/adyen-web/auto'
import '@adyen/adyen-web/styles/adyen.css';

export default {
    data() {
        return {
            dropin: null as Dropin | null,
        };
    },

    async mounted() {
        this.createCheckout();
    },

    methods: {
        async createCheckout() {
            const urlParams = new URLSearchParams(window.location.search);
            const countryCode = urlParams.get('countryCode') || 'US';
            const locale = urlParams.get('shopperLocale') || 'en-US';
            const amount = parseAmount(urlParams.get('amount') || DEFAULT_AMOUNT, countryCode);

            const runtimeConfig = useRuntimeConfig();
            const { id, sessionData } = await createSession(countryCode, locale, amount);

            const options: CoreConfiguration = {
                session: {
                    id,
                    sessionData
                },
                amount,
                countryCode,
                locale,
                environment: 'test',
                clientKey: runtimeConfig.public.clientKey,
                onPaymentCompleted(data: PaymentCompletedData, element?: UIElement) {
                    console.log('onPaymentCompleted', data, element);
                },
                onPaymentFailed(data: PaymentFailedData, element?: UIElement) {
                    console.log('onPaymentFailed', data, element);
                },
                onError(error: AdyenCheckoutError) {
                    console.error('Something went wrong', error);
                },
            };

            const checkout = await AdyenCheckout(options);

            this.dropin = new Dropin(checkout, {
                paymentMethodsConfiguration: {
                    card: {
                        _disableClickToPay: true
                    }
                }
            });
            this.dropin.mount(this.$refs.dropinRef as HTMLElement);
        }
    }
};
</script>

<template>
    <div>
        <div class="payment" ref="dropinRef"></div>
    </div>
</template>

<style scoped>
.payment {
    margin: auto;
    max-width: 800px;
}
</style>