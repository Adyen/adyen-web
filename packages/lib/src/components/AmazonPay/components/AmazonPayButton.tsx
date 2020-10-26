import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { getAmazonSignature, getCheckoutLocale, getPayloadJSON } from '../utils';
import { AmazonPayButtonProps, AmazonPayButtonSettings, CheckoutSessionConfig, PayloadJSON } from '../types';
import useCoreContext from '../../../core/Context/useCoreContext';

export default function AmazonPayButton(props: AmazonPayButtonProps) {
    const { loadingContext } = useCoreContext();
    const { amazonRef, buttonColor, configuration = {}, currency, environment, locale, placement, productType, region } = props;
    const { merchantId, publicKeyId } = configuration;
    const sandbox = environment === 'TEST';
    const checkoutLanguage = getCheckoutLocale(locale, region);

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
            sandbox,
            productType,
            placement,
            checkoutLanguage,
            ledgerCurrency: currency
        };

        const checkoutSessionConfig: CheckoutSessionConfig = {
            payloadJSON: JSON.stringify(payloadJSON),
            signature,
            publicKeyId
        };

        const amazonPayButton = amazonRef.Pay.renderButton('#amazonPayButton', settings);

        amazonPayButton.onClick(() => {
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
