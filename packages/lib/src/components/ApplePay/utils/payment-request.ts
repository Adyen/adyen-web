import { getDecimalAmount } from '../../../utils/amount-util';
import { PaymentAmount } from '../../../types/global-types';
import { ApplePayConfiguration } from '../types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import defaultProps from '../defaultProps';

const formatAmount = (amount: PaymentAmount) => String(getDecimalAmount(amount.value, amount.currency));

export const preparePaymentRequest = (
    paymentRequest: ApplePayConfiguration & {
        countryCode?: string;
        companyName?: string;
    }
): ApplePayJS.ApplePayPaymentRequest => {
    const { countryCode, companyName, amount, ...props } = paymentRequest;

    if (!countryCode) {
        throw new AdyenCheckoutError(
            'IMPLEMENTATION_ERROR',
            'Apple Pay - Missing countryCode. Set it in the AdyenCheckout configuration or in the Checkout Session creation'
        );
    }

    if (!amount) {
        throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Apple Pay - Missing amount');
    }

    if (!props.totalPriceLabel) {
        throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Apple Pay - Missing totalPriceLabel');
    }

    const merchantCapabilities = props.merchantCapabilities ?? defaultProps.merchantCapabilities;
    const supportedNetworks = props.supportedNetworks ?? defaultProps.supportedNetworks;

    if (!merchantCapabilities || !supportedNetworks) {
        throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Apple Pay - Missing merchantCapabilities or supportedNetworks');
    }

    const formattedAmount = formatAmount(amount);

    return {
        countryCode,
        currencyCode: amount.currency,

        total: {
            label: props.totalPriceLabel,
            amount: formattedAmount,
            type: props.totalPriceStatus
        },

        lineItems: props.lineItems,
        shippingContactEditingMode: props.shippingContactEditingMode,
        shippingMethods: props.shippingMethods,
        shippingType: props.shippingType,

        recurringPaymentRequest: props.recurringPaymentRequest,

        merchantCapabilities,
        supportedCountries: props.supportedCountries,
        supportedNetworks,

        requiredShippingContactFields: props.requiredShippingContactFields,
        requiredBillingContactFields: props.requiredBillingContactFields,

        billingContact: props.billingContact,
        shippingContact: props.shippingContact,

        applicationData: props.applicationData,

        couponCode: props.couponCode,
        supportsCouponCode: props.supportsCouponCode
    };
};

export default preparePaymentRequest;
