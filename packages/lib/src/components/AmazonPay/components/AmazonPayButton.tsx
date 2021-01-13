import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { getAmazonSignature } from '../services';
import { getCheckoutLocale, getPayloadJSON } from '../utils';
import { AmazonPayButtonProps, AmazonPayButtonSettings, CheckoutSessionConfig, PayloadJSON } from '../types';
import useCoreContext from '../../../core/Context/useCoreContext';

export default function AmazonPayButton(props: AmazonPayButtonProps) {
    const { loadingContext } = useCoreContext();
    const { amazonRef, buttonColor, configuration = {} } = props;
    const { merchantId, publicKeyId } = configuration;
    const checkoutLanguage = getCheckoutLocale(props.locale, props.region);

    const handleOnClick = (amazonPayButton, createCheckoutSessionConfig) => {
        new Promise(props.onClick)
            .then(() => {
                amazonPayButton.initCheckout({ createCheckoutSessionConfig });
            })
            .catch(console.error);
    };

    const renderAmazonPayButton = (payloadJSON: PayloadJSON, signature: string): void => {
        const settings: AmazonPayButtonSettings = {
            ...(buttonColor && { buttonColor }),
            merchantId,
            sandbox: props.environment === 'TEST',
            productType: props.productType,
            placement: props.placement,
            checkoutLanguage,
            ledgerCurrency: props.currency
        };

        const amazonPayButton = amazonRef.Pay.renderButton('#amazonPayButton', settings);

        amazonPayButton.onClick(() => {
            const checkoutSessionConfig: CheckoutSessionConfig = {
                payloadJSON: JSON.stringify(payloadJSON),
                signature,
                publicKeyId
            };

            handleOnClick(amazonPayButton, checkoutSessionConfig);
        });
    };

    useEffect(() => {
        const { clientKey, deliverySpecifications, returnUrl } = props;
        const payloadJSON = getPayloadJSON(configuration.storeId, returnUrl, deliverySpecifications);

        getAmazonSignature(loadingContext, clientKey, payloadJSON)
            .then(response => {
                if (!response?.signature) return console.error('Could not get AmazonPay signature');
                renderAmazonPayButton(payloadJSON, response.signature);
            })
            .catch(error => {
                console.error(error);
                if (props.onError) props.onError(error);
            });
    }, []);

    return <div className="adyen-checkout__amazonpay__button" id="amazonPayButton" />;
}
