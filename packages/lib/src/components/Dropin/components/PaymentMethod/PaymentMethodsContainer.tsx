import { h } from 'preact';
import PaymentMethodItem from './PaymentMethodItem/PaymentMethodItem';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useMemo } from 'preact/hooks';
import uuid from '../../../../utils/uuid';
import classNames from 'classnames';
import UIElement from '../../../internal/UIElement';

export interface PaymentMethodsContainerProps {
    label?: string;
    classNameModifiers?: string[];
    paymentMethods: UIElement[];
    activePaymentMethod?: UIElement;
    showRemovePaymentMethodButton?: boolean;
    onSelect?: (paymentMethod: UIElement) => void;
    onDisableStoredPaymentMethod?: (storedPaymentMethod) => void;
    isDisablingPaymentMethod?: boolean;
    isLoading: boolean;
    showRadioButton?: boolean;
}

function PaymentMethodsContainer({
    label,
    classNameModifiers = [],
    paymentMethods = [],
    activePaymentMethod = null,
    isLoading = false,
    isDisablingPaymentMethod = false,
    showRemovePaymentMethodButton,
    onDisableStoredPaymentMethod = () => {},
    onSelect,
    showRadioButton
}: Readonly<PaymentMethodsContainerProps>) {
    const { i18n } = useCoreContext();
    const selectListId: string = useMemo(() => `select-${uuid()}`, []);
    const paymentMethodListClassnames = classNames([
        'adyen-checkout__payment-methods-list',
        { 'adyen-checkout__payment-methods-list--loading': isLoading },
        ...classNameModifiers.map(m => `adyen-checkout__payment-methods-list--${m}`)
    ]);

    const standalone = paymentMethods.length === 1;

    return (
        <div className="adyen-checkout-payment-methods-container">
            {!!label && (
                <label htmlFor={selectListId} className="adyen-checkout-payment-methods-list-label">
                    {label}
                </label>
            )}
            <div
                id={selectListId}
                className={paymentMethodListClassnames}
                role={standalone ? undefined : 'radiogroup'}
                aria-label={standalone ? undefined : i18n.get('paymentMethodsList.aria.label')}
            >
                {paymentMethods.map((paymentMethod, index, paymentMethodsCollection) => {
                    const isSelected = activePaymentMethod && activePaymentMethod._id === paymentMethod._id;
                    const isNextOneSelected =
                        activePaymentMethod &&
                        paymentMethodsCollection[index + 1] &&
                        activePaymentMethod._id === paymentMethodsCollection[index + 1]._id;

                    return (
                        <PaymentMethodItem
                            className={classNames({ 'adyen-checkout__payment-method--next-selected': isNextOneSelected })}
                            standalone={standalone}
                            paymentMethod={paymentMethod}
                            isSelected={isSelected}
                            isDisablingPaymentMethod={isSelected && isDisablingPaymentMethod}
                            isLoading={isLoading}
                            onSelect={onSelect}
                            key={paymentMethod._id}
                            showRemovePaymentMethodButton={showRemovePaymentMethodButton}
                            showRadioButton={showRadioButton}
                            onDisableStoredPaymentMethod={onDisableStoredPaymentMethod}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default PaymentMethodsContainer;
