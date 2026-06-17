import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { GooglePaymentMode } from '../GooglePay';
import GooglePayButton from './GooglePayButton';
import GoogleAcceleratedCheckout from './GoogleAcceleratedCheckout';
import GoogleAcceleratedCheckoutClient from '../services/GoogleAcceleratedCheckoutClient';
import GooglePayService from '../GooglePayService';

interface Props {
    defaultMode: GooglePaymentMode;
    googleButtonClient: GooglePayService;
    googleAcceleratedCheckoutClient: GoogleAcceleratedCheckoutClient;
    showPayButton: boolean;
    googleButtonProps: {
        buttonColor: google.payments.api.ButtonColor;
        buttonType: google.payments.api.ButtonType;
        buttonSizeMode: google.payments.api.ButtonSizeMode;
        buttonLocale: string;
        buttonRadius?: number;
        buttonRootNode?: HTMLDocument | ShadowRoot;
        onClick: (e: Event) => void;
    };
}

const GooglePayComponent = ({
    defaultMode,
    googleAcceleratedCheckoutClient,
    googleButtonClient,
    showPayButton,
    googleButtonProps
}: Readonly<Props>) => {
    const [activeMode, setPaymentMode] = useState<GooglePaymentMode>(defaultMode);

    console.log('[Adyen] GooglePayComponent active mode', activeMode);

    const onAcceleratedCheckoutLoadFailed = useCallback(() => {
        setPaymentMode(GooglePaymentMode.STANDARD_BUTTON);
    }, []);

    if (activeMode === GooglePaymentMode.ACCELERATED_CHECKOUT) {
        if (!showPayButton) {
            console.warn('GooglePay: showPayButton=false is not compatible with Google Accelerated Checkout');
        }

        return <GoogleAcceleratedCheckout paymentsClient={googleAcceleratedCheckoutClient} onFail={onAcceleratedCheckoutLoadFailed} />;
    }

    return showPayButton ? <GooglePayButton {...googleButtonProps} paymentsClient={googleButtonClient} /> : null;
};

export { GooglePayComponent };
