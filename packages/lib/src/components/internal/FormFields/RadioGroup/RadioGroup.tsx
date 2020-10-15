import { h } from 'preact';
import cx from 'classnames';
import './RadioGroup.scss';
import { RadioGroupProps } from './types';

export default function RadioGroup(props: RadioGroupProps) {
    const { items, i18n, name, onChange, value, isInvalid } = props;

    return (
        <div className="adyen-checkout__radio_group">
            {items.map(item => (
                <label key={item.id} className="adyen-checkout__radio_group__input-wrapper">
                    <input
                        type="radio"
                        checked={value === item.id}
                        className="adyen-checkout__radio_group__input"
                        name={name}
                        onChange={onChange}
                        onClick={onChange}
                        value={item.id}
                    />
                    <span
                        className={cx([
                            'adyen-checkout__label__text',
                            'adyen-checkout__radio_group__label',
                            props.className,
                            { 'adyen-checkout__radio_group__label--invalid': isInvalid }
                        ])}
                    >
                        {i18n.get(item.name)}
                    </span>
                </label>
            ))}
        </div>
    );
}

RadioGroup.defaultProps = {
    onChange: () => {},
    items: []
};
