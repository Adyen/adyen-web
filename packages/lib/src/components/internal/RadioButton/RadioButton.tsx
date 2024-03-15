import { ComponentChildren, h } from 'preact';
import classNames from 'classnames';
import './RadioButton.scss';

interface RadioButtonProps {
    buttonId: string;
    isSelected: boolean;
    children: ComponentChildren;
}

function RadioButton({ buttonId, isSelected, children }: Readonly<RadioButtonProps>) {
    return (
        <button className="adyen-checkout__payment-method__header__title" id={buttonId} role="radio" aria-checked={isSelected} type="button">
            <span
                className={classNames({
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
