import { h } from 'preact';
import cx from 'classnames';
import './RadioGroup.scss';
import { RadioGroupProps } from './types';
import { getUniqueId } from '../../../../utils/idGenerator';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

export default function RadioGroup(props: RadioGroupProps) {
    const { items, name, onChange, value, isInvalid, uniqueId } = props;

    const { i18n } = useCoreContext();
    const uniqueIdBase = uniqueId?.replace(/[0-9]/g, '').substring(0, uniqueId.lastIndexOf('-'));

    return (
        <div className="adyen-checkout__radio_group">
            {items.map(item => {
                const uniqueId = getUniqueId(uniqueIdBase);
                return (
                    <div key={item.id} className="adyen-checkout__radio_group__input-wrapper">
                        <input
                            id={uniqueId}
                            type="radio"
                            checked={value === item.id}
                            className="adyen-checkout__radio_group__input"
                            name={name}
                            onChange={onChange}
                            onClick={onChange}
                            value={item.id}
                        />
                        <label
                            className={cx([
                                'adyen-checkout__label__text',
                                'adyen-checkout__radio_group__label',
                                props.className,
                                { 'adyen-checkout__radio_group__label--invalid': isInvalid }
                            ])}
                            htmlFor={uniqueId}
                        >
                            {i18n.get(item.name)}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}

RadioGroup.defaultProps = {
    onChange: () => {},
    items: []
};
