import { getDecimalAmount } from '~/utils/amount-util';

const formatAmount = (amount, currencyCode) => String(getDecimalAmount(amount, currencyCode));

export const preparePaymentRequest = ({ countryCode, companyName, currencyCode, amount, ...props }): ApplePayJS.ApplePayPaymentRequest => {
    const formattedAmount = formatAmount(amount, currencyCode);

    return {
        countryCode,
        currencyCode,

        total: {
            label: props.totalPriceLabel,
            amount: formattedAmount,
            type: props.totalPriceStatus
        },

        lineItems: props.lineItems,
        shippingMethods: props.shippingMethods,
        shippingType: props.shippingType,
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
