import { Component, h } from 'preact';
import cx from 'classnames';
import './ApplePayButton.scss';
import Language from '../../../language/Language';
import { ApplePayButtonType } from '../types';

interface ApplePayButtonProps {
    i18n: Language;
    buttonColor: 'black' | 'white' | 'white-with-line';
    buttonType: ApplePayButtonType;
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
            <button
                type="button"
                aria-label={this.props.i18n.get('payButton')}
                lang={this.props.i18n.languageCode}
                className={cx(
                    'adyen-checkout__applepay__button',
                    `adyen-checkout__applepay__button--${buttonColor}`,
                    `adyen-checkout__applepay__button--${buttonType}`,
                    'apple-pay',
                    'apple-pay-button',
                    `apple-pay-button-${buttonColor}`,
                    `apple-pay-button--type-${buttonType}`
                )}
                onClick={this.props.onClick}
            />
        );
    }
}

export default ApplePayButton;
