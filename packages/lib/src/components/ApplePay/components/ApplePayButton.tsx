import { h } from 'preact';
import type { ApplePayButtonStyle, ApplePayButtonType } from '../types';
import './ApplePayButton.scss';

interface ApplePayButtonProps {
    buttonStyle: ApplePayButtonStyle;
    buttonType: ApplePayButtonType;
    buttonLocale: string;
    onClick(): void;
}

const ApplePayButton = ({ buttonStyle, buttonType, buttonLocale, onClick }: ApplePayButtonProps) => {
    return <apple-pay-button data-testid="apple-pay-button" buttonstyle={buttonStyle} type={buttonType} locale={buttonLocale} onclick={onClick} />;
};

export default ApplePayButton;
