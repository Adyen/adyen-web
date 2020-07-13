import { getDecimalAmount } from '../../utils/amount-util';
import config from './config';
import { GooglePayProps } from './types';

/**
 * Configure your site's support for payment methods supported by the Google Pay API.
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#IsReadyToPayRequest|isReadyToPayRequest}
 * @returns Google Pay API version, payment methods supported by the site
 */
export function isReadyToPayRequest({
    allowedAuthMethods,
    allowedCardNetworks,
    existingPaymentMethodRequired = true
}): google.payments.api.IsReadyToPayRequest {
    return {
        apiVersion: config.API_VERSION,
        apiVersionMinor: config.API_VERSION_MINOR,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods,
                    allowedCardNetworks
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {}
                }
            }
        ],
        existingPaymentMethodRequired
    };
}

/**
 * Provide Google Pay API with a payment amount, currency, and amount status
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#TransactionInfo|TransactionInfo}
 * @returns transaction info, suitable for use as transactionInfo property of PaymentDataRequest
 */
export function getTransactionInfo(
    currencyCode = 'USD',
    totalPrice = 0,
    totalPriceStatus: google.payments.api.TotalPriceStatus = 'FINAL',
    countryCode = 'US'
): google.payments.api.TransactionInfo {
    const formattedPrice = String(getDecimalAmount(totalPrice, currencyCode));

    return {
        countryCode,
        currencyCode,
        totalPrice: formattedPrice,
        totalPriceStatus // Price will not change
    };
}

export function initiatePaymentRequest({ configuration, ...props }: GooglePayProps): google.payments.api.PaymentDataRequest {
    return {
        apiVersion: config.API_VERSION,
        apiVersionMinor: config.API_VERSION_MINOR,
        transactionInfo: getTransactionInfo(props.amount.currency, props.amount.value, props.totalPriceStatus, props.countryCode),
        merchantInfo: {
            merchantId: configuration.merchantIdentifier,
            merchantName: configuration.merchantName
        },
        allowedPaymentMethods: [
            {
                type: 'CARD',
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: config.GATEWAY,
                        gatewayMerchantId: configuration.gatewayMerchantId
                    }
                },
                parameters: {
                    allowedAuthMethods: props.allowedAuthMethods,
                    allowedCardNetworks: props.allowedCardNetworks,
                    allowPrepaidCards: props.allowPrepaidCards,
                    allowCreditCards: props.allowCreditCards,
                    billingAddressRequired: props.billingAddressRequired,
                    billingAddressParameters: props.billingAddressParameters
                }
            }
        ],
        emailRequired: props.emailRequired,
        shippingAddressRequired: props.shippingAddressRequired,
        shippingAddressParameters: props.shippingAddressParameters,
        shippingOptionRequired: props.shippingOptionRequired,
        shippingOptionParameters: props.shippingOptionParameters,
        callbackIntents: props.callbackIntents
    };
}
