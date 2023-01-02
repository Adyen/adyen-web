import { Component, h } from 'preact';
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

class GooglePayButton extends Component<GooglePayButtonProps> {
    public paywithgoogleWrapper;

    public static defaultProps = {
        buttonColor: 'default', // default (black), black, white
        buttonType: 'long', // long, short
        buttonSizeMode: 'static' // long, short
    };
    private clicked = false;

    private handleClick = e => {
        e.preventDefault();
        e.stopPropagation();

        if (!this.clicked) {
            this.props.onClick(e);
            this.clicked = true;

            setTimeout(() => {
                this.clicked = false;
            }, 300);
        }
    };

    componentDidMount() {
        const { buttonColor, buttonType, buttonLocale, buttonSizeMode, buttonRootNode, paymentsClient } = this.props;

        paymentsClient
            .then(client =>
                client.createButton({
                    onClick: this.handleClick,
                    buttonType,
                    buttonColor,
                    buttonLocale,
                    buttonSizeMode,
                    buttonRootNode
                })
            )
            .then(googlePayButton => {
                this.paywithgoogleWrapper.appendChild(googlePayButton);
            });
    }

    render() {
        return (
            <span
                className={'adyen-checkout__paywithgoogle'}
                ref={ref => {
                    this.paywithgoogleWrapper = ref;
                }}
            />
        );
    }
}

export default GooglePayButton;
