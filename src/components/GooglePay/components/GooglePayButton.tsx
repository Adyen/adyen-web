import { Component, h } from 'preact';
import './GooglePayButton.scss';

interface GooglePayButtonProps {
    buttonColor: google.payments.api.ButtonColor;
    buttonType: google.payments.api.ButtonType;
    paymentsClient: google.payments.api.PaymentsClient;
    onClick: (e: Event) => void;
}

class GooglePayButton extends Component<GooglePayButtonProps> {
    public paywithgoogleWrapper;

    public static defaultProps = {
        buttonColor: 'default', // default (black), black, white
        buttonType: 'long' // long, short
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
        const { buttonColor, buttonType, paymentsClient } = this.props;

        const googlePayButton = paymentsClient.createButton({ onClick: this.handleClick, buttonType, buttonColor });
        this.paywithgoogleWrapper.appendChild(googlePayButton);
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
