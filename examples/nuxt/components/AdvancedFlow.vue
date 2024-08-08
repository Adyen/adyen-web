<script lang="ts">
import { AdyenCheckout, Dropin } from '@adyen/adyen-web/auto';
import '@adyen/adyen-web/styles/adyen.css';

export default {
  data() {
    return {
      dropin: null
    };
  },

  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.sessionId = urlParams.get('sessionId');
    this.redirectResult = urlParams.get('redirectResult');

    this.createCheckout();
  },

  methods: {
    async createCheckout() {
      const urlParams = new URLSearchParams(window.location.search);
      const countryCode = urlParams.get('countryCode') || 'US';
      const locale = urlParams.get('shopperLocale') || 'en-US';
      const amount = parseAmount(urlParams.get('amount') || 2000, countryCode);

      const runtimeConfig = useRuntimeConfig();

      const { id, sessionData } = await createSession(countryCode, locale, amount);

      const options = {
        session: {
          id,
          sessionData
        },
        amount,
        countryCode,
        locale,
        environment: 'test',
        clientKey: runtimeConfig.public.clientKey,
        onError(error) {
          console.error('Something went wrong', error);
        },
        onPaymentCompleted(data, element) {
          console.log('onPaymentCompleted', data, element);
        },
        onPaymentFailed(data, element) {
          console.log('onPaymentFailed', data, element);
        }
      };

      const checkout = await AdyenCheckout(options);
      this.dropin = new Dropin(checkout, {
        paymentMethodsConfiguration: {
          card: {
            _disableClickToPay: true
          }
        }
      });
      this.dropin.mount(this.$refs[this.type]);
    }
  }
};
</script>

<template>
  <div>
    <div class="payment" :ref="`${type}`"></div>
  </div>
</template>
