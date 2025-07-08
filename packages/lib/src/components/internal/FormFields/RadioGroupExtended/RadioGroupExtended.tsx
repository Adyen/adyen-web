import { h } from 'preact';
import cx from 'classnames';
import { RadioGroupExtendedProps } from './types';
import { getUniqueId } from '../../../../utils/idGenerator';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import RadioButtonIcon from './RadioButtonIcon';
import Icon from '../../Icon';
import { PREFIX } from '../../Icon/constants';
import './RadioGroupExtended.scss';
import '../RadioGroup/RadioGroup.scss';

export default function RadioGroupExtended(props: RadioGroupExtendedProps) {
    const { items, name, onChange, value, isInvalid, uniqueId, ariaLabel, showRadioIcon = false, showSelectedTick = false, style = 'button' } = props;

    const { i18n } = useCoreContext();
    const uniqueIdBase = uniqueId?.replace(/[0-9]/g, '').substring(0, uniqueId.lastIndexOf('-'));

    let invalidClassName = '';
    if (isInvalid) {
        invalidClassName = showRadioIcon ? 'adyen-checkout__radio_group__label--invalid' : 'adyen-checkout__radio_group__label--no-radio--invalid';
    }

    const fieldClassnames = cx([
        'adyen-checkout__label__text',
        showRadioIcon ? 'adyen-checkout__radio_group__label' : 'adyen-checkout__radio_group__label--no-radio',
        props.className,
        invalidClassName
    ]);

    return (
        <div
            className={cx(['adyen-checkout__radio_group', `adyen-checkout__radio_group--${style}`])}
            role={'radiogroup'}
            {...(ariaLabel && { ['aria-label']: ariaLabel })}
        >
            {items.map(item => {
                const uniqueId = getUniqueId(uniqueIdBase);

                return (
                    <div key={item.id} className="adyen-checkout__radio_group__input-wrapper adyen-checkout__field--50">
                        <input
                            id={uniqueId}
                            type={'radio'}
                            checked={value === item.id}
                            className="adyen-checkout__radio_group__input"
                            name={name}
                            onChange={onChange}
                            value={item.id}
                        />

                        <label className={fieldClassnames} htmlFor={uniqueId}>
                            <div className={'adyen-checkout__radio_group-extended__label-wrapper'}>
                                <RadioButtonIcon
                                    key={item.id}
                                    imageURL={item.imageURL}
                                    altName={item.altName}
                                    dataValue={item.id}
                                    showRadioIcon={showRadioIcon}
                                />
                                <span className={'adyen-checkout__radio_group-extended__label'}>{i18n.get(item.name)}</span>
                                {showSelectedTick && (
                                    <span
                                        className={cx({
                                            'adyen-checkout-input__inline-validation': true,
                                            'adyen-checkout-input__inline-validation--valid': value === item.id
                                        })}
                                    >
                                        <Icon type={`${PREFIX}checkmark`} alt={i18n?.get('field.valid')} />
                                    </span>
                                )}
                            </div>
                        </label>
                    </div>
                );
            })}
        </div>
    );
}

RadioGroupExtended.defaultProps = {
    onChange: () => {},
    items: []
};
