import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export default function AmazonPayButton(props) {
    const { amazonRef, currency, environment, locale, merchantId, placement, productType, sessionUrl } = props;
    const sandbox = environment && environment.toLowerCase() === 'test';
    const amazonPayButtonRef = useRef(null);

    useEffect(() => {
        amazonRef.Pay.renderButton('#amazonPayButton', {
            merchantId,
            sandbox,
            productType,
            placement,
            createCheckoutSession: {
                url: sessionUrl
            },
            ledgerCurrency: currency,
            ...(locale && { checkoutLanguage: locale.replace('-', '_') })

        });
    }, []);

    return (
        <div className="adyen-checkout__amazonpay__button" id="amazonPayButton" ref={amazonPayButtonRef} />
    );
}
