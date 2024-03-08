import { getDecimalAmount } from '../../utils/amount-util';
import { PaymentAmount } from '../../types';

const formatAmount = (amount: PaymentAmount) => String(getDecimalAmount(amount.value, amount.currency));

export const preparePaymentRequest = (paymentRequest): ApplePayJS.ApplePayPaymentRequest => {
    const { countryCode, companyName, amount, ...props } = paymentRequest;

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
        shippingMethods: props.shippingMethods,
        shippingType: props.shippingType,

        recurringPaymentRequest: props.recurringPaymentRequest,

        merchantCapabilities: props.merchantCapabilities,
        supportedCountries: props.supportedCountries,
        supportedNetworks: props.supportedNetworks,

        requiredShippingContactFields: props.requiredShippingContactFields,
        requiredBillingContactFields: props.requiredBillingContactFields,

        billingContact: props.billingContact,
        shippingContact: props.shippingContact,

        applicationData: props.applicationData
    };
};

export default preparePaymentRequest;
