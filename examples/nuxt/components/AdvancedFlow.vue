<script lang="ts">
import { DEFAULT_AMOUNT } from '~/constants';
import { AdyenCheckout, Dropin } from '@adyen/adyen-web/auto';
import type { AdyenCheckoutError, UIElement, AdditionalDetailsActions, AdditionalDetailsData, CoreConfiguration, PaymentCompletedData, PaymentFailedData } from '@adyen/adyen-web/auto';
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
            const paymentMethodsResponse = await fetchPaymentMethods(countryCode, locale, amount);

            const options: CoreConfiguration = {
                paymentMethodsResponse,
                amount,
                countryCode,
                locale,
                environment: 'test',
                clientKey: runtimeConfig.public.clientKey,
                onSubmit: async (state, component, actions) => {
                    try {
                        const result = await makePaymentsCall(state.data, countryCode, locale, amount);

                        if (!result.resultCode) {
                            actions.reject();
                            return;
                        }

                        const { resultCode, action, order, donationToken } = result;

                        actions.resolve({
                            resultCode,
                            action,
                            order,
                            donationToken
                        });
                    } catch (error) {
                        console.error('onSubmit', error);
                        actions.reject();
                    }
                },
                onAdditionalDetails: async (state: AdditionalDetailsData, component: UIElement, actions: AdditionalDetailsActions) => {
                    try {
                        const result = await makeDetailsCall(state.data);

                        if (!result.resultCode) {
                            actions.reject();
                            return;
                        }

                        const { resultCode, action, order, donationToken } = result;

                        actions.resolve({
                            resultCode,
                            action,
                            order,
                            donationToken
                        });
                    } catch (error) {
                        console.error('onSubmit', error);
                        actions.reject();
                    }
                },
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
