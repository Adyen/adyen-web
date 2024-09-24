<script lang="ts">
import { DEFAULT_COUNTRY } from '~/constants';
import { AdyenCheckout } from '@adyen/adyen-web/auto';
import type {
    AdditionalDetailsActions,
    AdditionalDetailsData,
    AdyenCheckoutError,
    PaymentCompletedData,
    PaymentFailedData,
    UIElement
} from '@adyen/adyen-web/auto';
import '@adyen/adyen-web/styles/adyen.css';


export default {
    data() {
        return {
            response: 'Loading...',
        };
    },

    async mounted() {
        this.handleRedirectResult();
    },

    methods: {
        async handleRedirectResult() {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectResult = urlParams.get('redirectResult');
            const sessionId = urlParams.get('sessionId');
            const runtimeConfig = useRuntimeConfig();


            if (!redirectResult) {
                this.response = 'No redirectResult available';
                return;
            }

            const isSessionsFlow = !!sessionId;

            const checkout = await AdyenCheckout({
                analytics: {
                    enabled: false
                },
                clientKey: runtimeConfig.public.clientKey,
                environment: 'test',
                countryCode: DEFAULT_COUNTRY,

                // If it is sessions flow, pass the sessionId back to the library
                ...(isSessionsFlow && {
                    session: {
                        id: sessionId
                    }
                }),

                // If it is NOT sessions flow, add the 'onAdditionalDetails' so you can handle the /payment/details part here
                ...(!isSessionsFlow && {
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
                    }
                }),

                onPaymentCompleted: (data: PaymentCompletedData, component?: UIElement) => {
                    this.response = JSON.stringify(data, null, '\t');
                },
                onPaymentFailed: (data?: PaymentFailedData, component?: UIElement) => {
                    this.response = 'Payment failed';
                },
                onError: (error: AdyenCheckoutError) => {
                    this.response = 'Something went wrong';
                    console.error(error);
                }
            });

            checkout.submitDetails({ details: { redirectResult } });
        }
    }
};
</script>

<template>

    <Head>
        <Title>@adyen/adyen-web + Nuxt3</Title>
    </Head>
    <div class="redirect-result-page">
        <h1>Redirect response</h1>
        <pre class="result">{{ response }}</pre>
    </div>
</template>

<style scoped>
.redirect-result-page {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 20px;
    align-items: center;
    background-color: white;
    border-radius: 8px;
}

.result {
    width: 500px;
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>
