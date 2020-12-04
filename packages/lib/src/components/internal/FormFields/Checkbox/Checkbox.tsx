import { ComponentChild, h } from 'preact';
import cx from 'classnames';
import './Checkbox.scss';

interface CheckboxProps {
    checked?: boolean;
    classNameModifiers?: string[];
    label: string | ComponentChild;
    name?: string;
    isInvalid?: boolean;
    onChange?;
    onInput?;
    className?: string;
    value?: string;
}

export default function Checkbox({ classNameModifiers = [], label, isInvalid, onChange, ...props }: CheckboxProps) {
    return (
        <label className="adyen-checkout__checkbox">
            <input
                {...props}
                className={cx([
                    'adyen-checkout__checkbox__input',
                    [props.className],
                    { 'adyen-checkout__checkbox__input--invalid': isInvalid },
                    classNameModifiers.map(m => `adyen-checkout__input--${m}`)
                ])}
                type="checkbox"
                onChange={onChange}
            />
            <span className="adyen-checkout__checkbox__label">{label}</span>
        </label>
    );
}

Checkbox.defaultProps = {
    onChange: () => {}
};
