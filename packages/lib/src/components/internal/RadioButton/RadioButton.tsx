import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import './RadioButton.scss';

interface RadioButtonProps {
    buttonId: string;
    isSelected: boolean;
    children: ComponentChildren;
    classNames?: string[];
}

function RadioButton({ buttonId, isSelected, children, classNames = [] }: Readonly<RadioButtonProps>) {
    return (
        <button className={cx('adyen-checkout-radio-button', classNames)} id={buttonId} role="radio" aria-checked={isSelected} type="button">
            <span
                className={cx({
                    'adyen-checkout__payment-method__radio': true,
                    'adyen-checkout__payment-method__radio--selected': isSelected
                })}
                aria-hidden="true"
            />
            {children}
        </button>
    );
}
export default RadioButton;
