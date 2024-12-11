import { h } from 'preact';
import cx from 'classnames';
import './RadioGroupExtended.scss';
import { RadioGroupProps } from './types';
import { getUniqueId } from '../../../../utils/idGenerator';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import RadioButtonIcon from './RadioButtonIcon';

export default function RadioGroupExtended(props: RadioGroupProps) {
    const { items, name, onChange, value, isInvalid, uniqueId, ariaLabel, showRadioIcon = true, style = 'classic' } = props;

    const { i18n } = useCoreContext();
    const uniqueIdBase = uniqueId?.replace(/[0-9]/g, '').substring(0, uniqueId.lastIndexOf('-'));

    console.log('### RadioGroupExtended::RadioGroupExtended:: isInvalid', isInvalid);
    console.log('### RadioGroupExtended::RadioGroupExtended:: showRadioIcon', showRadioIcon);

    return (
        <div
            className={cx(['adyen-checkout__radio_group', `adyen-checkout__radio_group--${style}`])}
            role={'radiogroup'}
            {...(ariaLabel && { ['aria-label']: ariaLabel })}
        >
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
                                showRadioIcon ? 'adyen-checkout__radio_group__label' : 'adyen-checkout__radio_group__label--no-radio',
                                props.className,
                                { 'adyen-checkout__radio_group__label--invalid': isInvalid }
                            ])}
                            htmlFor={uniqueId}
                        >
                            <RadioButtonIcon
                                key={item.id}
                                // brand={item.id}
                                imageURL={item.imageURL}
                                altName={item.altName}
                                // onClick={dualBrandingChangeHandler}
                                dataValue={item.id}
                                // notSelected={dualBrandingSelected !== '' && dualBrandingSelected !== item.id}
                                hasRadioIcon={showRadioIcon}
                            />
                            {i18n.get(item.name)}
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
