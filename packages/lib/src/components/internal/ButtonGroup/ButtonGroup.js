import cx from 'classnames';
import './ButtonGroup.scss';
import { h } from 'preact';

const ButtonGroup = ({ options = [], name, onChange }) => (
    <div className="adyen-checkout__button-group">
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
