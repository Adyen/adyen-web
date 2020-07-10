import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { getAmazonSignature, getCheckoutLocale, getPayloadJSON } from '../utils';
import { AmazonPayButtonProps, AmazonPayButtonSettings, PayloadJSON } from '../types';
import useCoreContext from '~/core/Context/useCoreContext';

export default function AmazonPayButton(props: AmazonPayButtonProps) {
    const { loadingContext } = useCoreContext();
    const { amazonRef, currency, environment, locale, merchantId, placement, productType, publicKeyId, region } = props;
    const sandbox = environment && environment.toLowerCase() === 'test';
    const checkoutLanguage = getCheckoutLocale(locale, region);

    const renderAmazonPayButton = (payloadJSON: PayloadJSON, signature: string): void => {
        const settings: AmazonPayButtonSettings = {
            merchantId,
            sandbox,
            productType,
            placement,
            checkoutLanguage,
            ledgerCurrency: currency,
            createCheckoutSessionConfig: {
                payloadJSON: JSON.stringify(payloadJSON),
                signature,
                publicKeyId
            }
        };

        amazonRef.Pay.renderButton('#amazonPayButton', settings);
    };

    useEffect(() => {
        const { clientKey, originKey, storeId, returnUrl, deliverySpecifications } = props;
        const accessKey = clientKey || originKey;
        const payloadJSON = getPayloadJSON(storeId, returnUrl, deliverySpecifications);

        getAmazonSignature(loadingContext, payloadJSON, accessKey)
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
