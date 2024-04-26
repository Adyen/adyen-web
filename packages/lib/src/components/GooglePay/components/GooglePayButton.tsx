import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import './GooglePayButton.scss';

interface GooglePayButtonProps {
    buttonColor: google.payments.api.ButtonColor;
    buttonType: google.payments.api.ButtonType;
    buttonSizeMode: google.payments.api.ButtonSizeMode;
    buttonLocale: string;
    buttonRootNode?: HTMLDocument | ShadowRoot;
    paymentsClient: Promise<google.payments.api.PaymentsClient>;
    onClick: (e: Event) => void;
}

const GooglePayButton = (props: GooglePayButtonProps) => {
    const googlePayWrapperRef = useRef<HTMLDivElement | undefined>(undefined);

    useEffect(() => {
        const { onClick, buttonColor, buttonType, buttonLocale, buttonSizeMode, buttonRootNode, paymentsClient } = props;

        paymentsClient
            .then(client =>
                client.createButton({
                    onClick,
                    buttonType,
                    buttonColor,
                    buttonLocale,
                    buttonSizeMode,
                    buttonRootNode
                })
            )
            .then(googlePayButton => {
                if (googlePayWrapperRef.current) {
                    googlePayWrapperRef.current.appendChild(googlePayButton);
                }
            });
    }, [props.buttonColor, props.buttonType, props.buttonLocale, props.buttonSizeMode, props.buttonRootNode, props.paymentsClient]);

    return <div data-testid="googlepay-button-container" className={'adyen-checkout__paywithgoogle'} ref={googlePayWrapperRef} />;
};

export default GooglePayButton;
