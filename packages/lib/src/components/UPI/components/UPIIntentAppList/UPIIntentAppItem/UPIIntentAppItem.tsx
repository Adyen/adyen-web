import { h } from 'preact';
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
}

const UPIIntentAppItem = ({ app, imgSrc, isSelected, onSelect = () => {} }: UPIIntentAppItemProps): h.JSX.Element => {
    const buttonId = `adyen-checkout-upi-app-item-button-${app.id}`;
    const containerId = `adyen-checkout-upi-app-${app.id}`;
    const handleAppSelected = (app: App) => {
        onSelect(app);
    };

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
        <li
            className={cx({
                'adyen-checkout-upi-app-item': true,
                'adyen-checkout-upi-app-item--selected': isSelected
            })}
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
            {isSelected && <span className="adyen-checkout-upi-app-item__checkmark" />}
        </li>
    );
};

export default UPIIntentAppItem;
