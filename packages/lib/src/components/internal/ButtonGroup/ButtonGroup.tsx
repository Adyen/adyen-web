import cx from 'classnames';
import './ButtonGroup.scss';
import { h } from 'preact';
import type { JSX } from 'preact';

interface ButtonGroupOption {
    label: string;
    value: string | number;
    selected?: boolean;
    disabled?: boolean;
}

interface ButtonGroupProps {
    options: ButtonGroupOption[];
    name: string;
    ariaLabel: string;
    onChange: JSX.GenericEventHandler<HTMLInputElement>;
}

const ButtonGroup = ({ options, name, ariaLabel, onChange }: Readonly<ButtonGroupProps>) => (
    <div className="adyen-checkout__button-group" role="radiogroup" aria-label={ariaLabel}>
        {options.map(({ label, selected, value, disabled }, index) => (
            <label
                key={`${name}${index}`}
                className={cx({
                    'adyen-checkout__button': true,
                    'adyen-checkout__button--selected': selected,
                    'adyen-checkout__button--disabled': disabled
                })}
            >
                <input
                    type="radio"
                    className="adyen-checkout__button-group__input"
                    name={name}
                    value={value}
                    checked={selected}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="adyen-checkout__button-text">{label}</span>
            </label>
        ))}
    </div>
);

export default ButtonGroup;
