import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import './GooglePayButton.scss';
import GooglePayService from '../GooglePayService';

interface GooglePayButtonProps {
    buttonColor: google.payments.api.ButtonColor;
    buttonType: google.payments.api.ButtonType;
    buttonSizeMode: google.payments.api.ButtonSizeMode;
    buttonLocale: string;
    buttonRadius?: number;
    buttonRootNode?: HTMLDocument | ShadowRoot;
    paymentsClient: GooglePayService;
    onClick: (e: Event) => void;
}

const GooglePayButton = (props: Readonly<GooglePayButtonProps>) => {
    const googlePayWrapperRef = useRef<HTMLDivElement | undefined>(undefined);

    useEffect(() => {
        const { onClick, buttonRadius, buttonColor, buttonType, buttonLocale, buttonSizeMode, buttonRootNode, paymentsClient } = props;

        void paymentsClient
            .createButton({
                onClick,
                buttonType,
                buttonColor,
                buttonLocale,
                buttonSizeMode,
                buttonRootNode,
                ...(buttonRadius !== undefined && { buttonRadius })
            })
            .then(googlePayButton => {
                if (googlePayWrapperRef.current) {
                    googlePayWrapperRef.current.appendChild(googlePayButton);
                }
            });
    }, [props.buttonColor, props.buttonType, props.buttonLocale, props.buttonSizeMode, props.buttonRootNode, props.paymentsClient]);

    return <div data-testid="googlepay-button-container" className={'adyen-checkout__paywithgoogle'} ref={googlePayWrapperRef} />;
};

export default GooglePayButton;
