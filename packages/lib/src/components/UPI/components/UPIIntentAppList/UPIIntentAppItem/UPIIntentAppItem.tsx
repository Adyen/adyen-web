import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import { AppId } from '../../../types';
import RadioButton from '../../../../internal/RadioButton';
import uuid from '../../../../../utils/uuid';
import PaymentMethodIcon from '../../../../Dropin/components/PaymentMethod/PaymentMethodIcon';
import './UPIIntentAppItem.scss';

interface UPIIntentAppItemProps {
    appId: AppId;
    imgSrc: string;
    isSelected: boolean;
    isNextSelected?: boolean;
    onSelect?: Function;
    children?: ComponentChildren;
}

const UPIIntentAppItem = ({ appId, imgSrc, isSelected, isNextSelected, onSelect = () => {}, children }: UPIIntentAppItemProps): h.JSX.Element => {
    const _id = `adyen-checkout-upi-${appId.id}-${uuid()}`;
    const buttonId = `adyen-checkout-upi-app-item-radio-button-${_id}`;
    const handleAppItemSelected = (appId: AppId) => {
        onSelect(appId);
    };

    return (
        <li
            className={cx({
                'adyen-checkout-upi-app-item': true,
                'adyen-checkout-upi-app-item--selected': isSelected,
                'adyen-checkout-upi-app-item--next-selected': isNextSelected
            })}
            role="button"
            aria-expanded={isSelected}
            onClick={() => handleAppItemSelected(appId)}
        >
            <div className="adyen-checkout-upi-app-item-header">
                <RadioButton buttonId={buttonId} isSelected={isSelected}>
                    <PaymentMethodIcon src={imgSrc} altDescription={appId.name} type={appId.id}></PaymentMethodIcon>
                    <label htmlFor={buttonId}>{appId.name}</label>
                </RadioButton>
            </div>
            {isSelected && children && <div className="adyen-checkout-upi-app-item-details">{children}</div>}
        </li>
    );
};

export default UPIIntentAppItem;
