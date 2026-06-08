import { getDecimalAmount } from '../../../utils/amount-util';
import config from '../config';
import { ExtendedMerchantInfo, GooglePayConfiguration, GooglePaymentDataRequest } from '../types';

class PaymentDataRequest implements GooglePaymentDataRequest {
    public apiVersion: number;
    public apiVersionMinor: number;
    public merchantInfo: ExtendedMerchantInfo;
    public allowedPaymentMethods: google.payments.api.PaymentMethodSpecification[];
    public transactionInfo: google.payments.api.TransactionInfo;
    public emailRequired?: boolean;
    public shippingAddressRequired?: boolean;
    public shippingAddressParameters?: google.payments.api.ShippingAddressParameters;
    public shippingOptionRequired?: boolean;
    public shippingOptionParameters?: google.payments.api.ShippingOptionParameters;
    public callbackIntents?: google.payments.api.CallbackIntent[];

    constructor(props: GooglePayConfiguration) {
        this.apiVersion = config.API_VERSION;
        this.apiVersionMinor = config.API_VERSION_MINOR;

        this.merchantInfo = {
            merchantId: props.configuration.merchantId,
            merchantName: props.configuration.merchantName,
            ...(props.configuration.merchantOrigin ? { merchantOrigin: props.configuration.merchantOrigin } : {}),
            ...(props.configuration.authJwt ? { authJwt: props.configuration.authJwt } : {})
        };

        this.transactionInfo = this.getTransactionInfo({ countryCode: props.countryCode, ...props });

        this.allowedPaymentMethods = [
            {
                type: 'CARD',
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: config.GATEWAY,
                        gatewayMerchantId: props.configuration.gatewayMerchantId
                    }
                },
                parameters: {
                    allowedAuthMethods: props.allowedAuthMethods,
                    allowedCardNetworks: props.allowedCardNetworks,
                    assuranceDetailsRequired: props.assuranceDetailsRequired,
                    allowPrepaidCards: props.allowPrepaidCards,
                    allowCreditCards: props.allowCreditCards,
                    allowedIssuerCountryCodes: props.allowedIssuerCountryCodes,
                    blockedIssuerCountryCodes: props.blockedIssuerCountryCodes,
                    billingAddressRequired: props.billingAddressRequired,
                    billingAddressParameters: props.billingAddressParameters
                }
            }
        ];
        this.emailRequired = props.emailRequired;
        this.shippingAddressRequired = props.shippingAddressRequired;
        this.shippingAddressParameters = props.shippingAddressParameters;
        this.shippingOptionRequired = props.shippingOptionRequired;
        this.shippingOptionParameters = props.shippingOptionParameters;
        this.callbackIntents = props.callbackIntents;
    }

    private getTransactionInfo({
        amount,
        countryCode = 'US',
        totalPriceStatus = 'FINAL',
        ...props
    }: GooglePayConfiguration): google.payments.api.TransactionInfo {
        const formattedPrice = String(getDecimalAmount(amount.value, amount.currency));

        return {
            countryCode,
            currencyCode: amount.currency,
            totalPrice: formattedPrice,
            totalPriceStatus: totalPriceStatus,
            ...props.transactionInfo
        };
    }
}

export { PaymentDataRequest };
