import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import { ApiId } from '../../../types';
import RadioButton from '../../../../internal/RadioButton';
import uuid from '../../../../../utils/uuid';
import PaymentMethodIcon from '../../../../Dropin/components/PaymentMethod/PaymentMethodIcon';
import './UPIIntentAppItem.scss';

interface UPIIntentAppItemProps {
    appId: ApiId;
    isSelected: boolean;
    isNextSelected?: boolean;
    onSelect?: Function;
    children?: ComponentChildren;
}

const UPIIntentAppItem = ({
    appId: { id, name },
    isSelected,
    isNextSelected,
    onSelect = () => {},
    children
}: UPIIntentAppItemProps): h.JSX.Element => {
    const _id = `adyen-checkout-upi-${id}-${uuid()}`;
    const buttonId = `adyen-checkout-upi-app-item-radio-button-${_id}`;
    const handleAppItemSelected = (id: string) => {
        onSelect(id);
    };
    // https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/[pm-type]/[gpay].svg
    return (
        <li
            className={cx({
                'adyen-checkout-upi-app-item': true,
                'adyen-checkout-upi-app-item--selected': isSelected,
                'adyen-checkout-upi-app-item--next-selected': isNextSelected
            })}
            role="button"
            aria-expanded={isSelected}
            onClick={() => handleAppItemSelected(id)}
        >
            <div className="adyen-checkout-upi-app-item-header">
                <RadioButton buttonId={buttonId} isSelected={isSelected}>
                    <PaymentMethodIcon
                        src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/logos/mc.svg"
                        altDescription={name}
                        type={id}
                    ></PaymentMethodIcon>
                    <label htmlFor={buttonId}>{name}</label>
                </RadioButton>
            </div>
            {isSelected && children && <div className="adyen-checkout-upi-app-item-details">{children}</div>}
        </li>
    );
};

export default UPIIntentAppItem;
