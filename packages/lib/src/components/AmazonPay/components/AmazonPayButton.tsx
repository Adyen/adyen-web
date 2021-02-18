import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getAmazonSignature } from '../services';
import { getCheckoutLocale, getPayloadJSON } from '../utils';
import { AmazonPayButtonProps, AmazonPayButtonSettings, CheckoutSessionConfig, PayloadJSON } from '../types';
import useCoreContext from '../../../core/Context/useCoreContext';

export default function AmazonPayButton(props: AmazonPayButtonProps) {
    const { loadingContext } = useCoreContext();
    const { amazonRef, buttonColor, configuration = {} } = props;
    const [signature, setSignature] = useState<string>(null);
    const payloadJSON: PayloadJSON = getPayloadJSON(configuration.storeId, props.returnUrl, props.cancelUrl, props.deliverySpecifications);

    const settings: AmazonPayButtonSettings = {
        ...(buttonColor && { buttonColor }),
        checkoutLanguage: getCheckoutLocale(props.locale, props.region),
        ledgerCurrency: props.currency,
        merchantId: configuration.merchantId,
        productType: props.productType,
        placement: props.placement,
        sandbox: props.environment === 'TEST'
    };

    const handleOnClick = () => {
        new Promise(props.onClick).then(this.initCheckout).catch(error => {
            props.onError(error, this.componentRef);
        });
    };

    const renderAmazonPayButton = (): void => {
        const amazonPayButton = amazonRef.Pay.renderButton('#amazonPayButton', settings);
        amazonPayButton.onClick(handleOnClick);
    };

    this.initCheckout = () => {
        const checkoutSessionConfig: CheckoutSessionConfig = {
            payloadJSON: JSON.stringify(payloadJSON),
            publicKeyId: configuration.publicKeyId,
            signature
        };

        amazonRef.Pay.initCheckout({
            ...settings,
            createCheckoutSessionConfig: checkoutSessionConfig
        });
    };

    useEffect(() => {
        const { clientKey } = props;

        getAmazonSignature(loadingContext, clientKey, payloadJSON)
            .then(response => {
                if (!response?.signature) return console.error('Could not get AmazonPay signature');
                setSignature(response.signature);
                if (props.showPayButton) renderAmazonPayButton();
            })
            .catch(error => {
                console.error(error);
                if (props.onError) props.onError(error, this.componentRef);
            });
    }, []);

    if (!props.showPayButton) return null;
    return <div className="adyen-checkout__amazonpay__button" id="amazonPayButton" />;
}
