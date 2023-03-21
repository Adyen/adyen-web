import { getDecimalAmount } from '../../utils/amount-util';

const formatAmount = amount => String(getDecimalAmount(amount.value, amount.currency));

export const preparePaymentRequest = ({ countryCode, companyName, amount, ...props }): ApplePayJS.ApplePayPaymentRequest => {
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

        // @ts-ignore 'recurringPaymentRequest' isn't defined in the @types/applepayjs
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
