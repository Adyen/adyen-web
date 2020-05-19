import { Component, h } from 'preact';
import styles from './ApplePayButton.module.scss';
import './ApplePayButton.scss';

interface ApplePayButtonProps {
    buttonColor: 'black' | 'white' | 'white-with-line';
    buttonType: 'plain' | 'buy' | 'donate' | 'check-out' | 'book' | 'subscribe';
    onClick: (event) => void;
}

class ApplePayButton extends Component<ApplePayButtonProps> {
    public static defaultProps = {
        onClick: () => {},
        buttonColor: 'black',
        buttonType: 'plain'
    };

    render({ buttonColor, buttonType }) {
        return (
            <div
                className={`adyen-checkout__applepay__button
                            adyen-checkout__applepay__button--${buttonColor}
                            adyen-checkout__applepay__button--${buttonType}
                            ${styles['apple-pay-button']}
                            ${styles[`apple-pay-button-${buttonColor}`]}
                            ${styles[`apple-pay-button--type-${buttonType}`]}`}
                onClick={this.props.onClick}
            />
        );
    }
}

export default ApplePayButton;
