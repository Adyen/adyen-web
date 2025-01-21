import { h } from 'preact';
import type { ApplePayButtonStyle, ApplePayButtonType } from '../types';
import './ApplePayButton.scss';

interface ApplePayButtonProps {
    buttonStyle: ApplePayButtonStyle;
    buttonType: ApplePayButtonType;
    buttonLocale: string;
    onClick(): void;
}

// TODO: check onclick event
const ApplePayButton = ({ buttonStyle, buttonType, buttonLocale, onClick }: ApplePayButtonProps) => {
    return <apple-pay-button buttonstyle={buttonStyle} type={buttonType} locale={buttonLocale} onclick={onClick} />;
};

// class ApplePayButton extends Component<ApplePayButtonProps> {
//     public static defaultProps = {
//         onClick: () => {},
//         buttonColor: 'black',
//         buttonType: 'plain'
//     };
//
//     render({ buttonColor, buttonType }) {
//         return (
//             <button
//                 type="button"
//                 aria-label={this.props.i18n.get('payButton')}
//                 lang={this.props.i18n.languageCode}
//                 className={cx(
//                     'adyen-checkout__applepay__button',
//                     `adyen-checkout__applepay__button--${buttonColor}`,
//                     `adyen-checkout__applepay__button--${buttonType}`,
//                     'apple-pay',
//                     'apple-pay-button',
//                     `apple-pay-button-${buttonColor}`,
//                     `apple-pay-button--type-${buttonType}`
//                 )}
//                 onClick={this.props.onClick}
//             />
//         );
//     }
// }

export default ApplePayButton;
