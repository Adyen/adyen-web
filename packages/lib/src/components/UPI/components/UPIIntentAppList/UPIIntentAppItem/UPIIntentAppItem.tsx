import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import { App } from '../../../types';
import RadioButton from '../../../../internal/RadioButton';
import uuid from '../../../../../utils/uuid';
import PaymentMethodIcon from '../../../../Dropin/components/PaymentMethod/PaymentMethodIcon';
import './UPIIntentAppItem.scss';

interface UPIIntentAppItemProps {
    app: App;
    imgSrc: string;
    isSelected: boolean;
    isNextSelected?: boolean;
    onSelect?: Function;
    children?: ComponentChildren;
}

const UPIIntentAppItem = ({ app, imgSrc, isSelected, isNextSelected, onSelect = () => {}, children }: UPIIntentAppItemProps): h.JSX.Element => {
    const buttonId = `adyen-checkout-upi-app-item-radio-button-${app.id}-${uuid()}`;
    const handleAppSelected = (app: App) => {
        onSelect(app);
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
            onClick={() => handleAppSelected(app)}
        >
            <div className="adyen-checkout-upi-app-item-header">
                <RadioButton buttonId={buttonId} isSelected={isSelected}>
                    <PaymentMethodIcon src={imgSrc} altDescription={app.name} type={app.id}></PaymentMethodIcon>
                    <label htmlFor={buttonId}>{app.name}</label>
                </RadioButton>
            </div>
            {isSelected && children && <div className="adyen-checkout-upi-app-item-details">{children}</div>}
        </li>
    );
};

export default UPIIntentAppItem;
