import { getDecimalAmount } from '../../utils/amount-util';
import config from './config';
import { GooglePaymentDataRequest, GooglePayConfiguration } from './types';

/**
 * Configure your site's support for payment methods supported by the Google Pay API.
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#IsReadyToPayRequest|isReadyToPayRequest}
 * @returns Google Pay API version, payment methods supported by the site
 */
export function isReadyToPayRequest({
    allowedAuthMethods,
    allowedCardNetworks,
    existingPaymentMethodRequired = false
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
export function getTransactionInfo({
    amount,
    countryCode = 'US',
    totalPriceStatus = 'FINAL',
    ...props
}: Omit<GooglePayConfiguration, 'core'>): google.payments.api.TransactionInfo {
    const formattedPrice = String(getDecimalAmount(amount.value, amount.currency));

    return {
        countryCode,
        currencyCode: amount.currency,
        totalPrice: formattedPrice,
        totalPriceStatus: totalPriceStatus as google.payments.api.TotalPriceStatus,
        ...props.transactionInfo
    };
}

export function initiatePaymentRequest({ configuration, ...props }: Omit<GooglePayConfiguration, 'core'>): GooglePaymentDataRequest {
    return {
        apiVersion: config.API_VERSION,
        apiVersionMinor: config.API_VERSION_MINOR,
        transactionInfo: getTransactionInfo(props),
        merchantInfo: {
            merchantId: configuration.merchantId,
            merchantName: configuration.merchantName,
            ...(configuration.merchantOrigin ? { merchantOrigin: configuration.merchantOrigin } : {}),
            ...(configuration.authJwt ? { authJwt: configuration.authJwt } : {})
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
                    assuranceDetailsRequired: props.assuranceDetailsRequired,
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
