import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import { App } from '../../../types';
import PaymentMethodIcon from '../../../../Dropin/components/PaymentMethod/PaymentMethodIcon';
import ExpandButton from '../../../../internal/ExpandButton';
import './UPIIntentAppItem.scss';

interface UPIIntentAppItemProps {
    app: App;
    imgSrc: string;
    isSelected: boolean;
    onSelect?: Function;
    children?: ComponentChildren;
}

const UPIIntentAppItem = ({ app, imgSrc, isSelected, onSelect = () => {}, children }: UPIIntentAppItemProps): h.JSX.Element => {
    const buttonId = `adyen-checkout-upi-app-item-button-${app.id}`;
    const containerId = `adyen-checkout-upi-app-${app.id}`;
    const handleAppSelected = (app: App) => {
        onSelect(app);
    };

    return (
        <li
            className={cx({
                'adyen-checkout-upi-app-item': true,
                'adyen-checkout-upi-app-item--selected': isSelected
            })}
            role="button"
            aria-expanded={isSelected}
            onClick={() => handleAppSelected(app)}
        >
            <div className="adyen-checkout-upi-app-item-header">
                <ExpandButton classNameModifiers={['upi-app-item']} buttonId={buttonId} isSelected={isSelected} expandContentId={containerId}>
                    <PaymentMethodIcon src={imgSrc} altDescription={app.name} type={app.id}></PaymentMethodIcon>
                    <label className="adyen-checkout-upi-app-item__label" htmlFor={buttonId}>
                        {app.name}
                    </label>
                </ExpandButton>
            </div>
            {isSelected && children && (
                <div className="adyen-checkout-upi-app-item-details" id={containerId}>
                    {children}
                </div>
            )}
        </li>
    );
};

export default UPIIntentAppItem;
