import { h } from 'preact';
import UIElement from '../../../UIElement';
import PaymentMethodItem from './PaymentMethodItem';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import uuid from '../../../../utils/uuid';
import classNames from 'classnames';

export interface PaymentMethodsContainerProps {
    label: string;
    classNameModifiers?: string[];
    paymentMethods: UIElement[];
    activePaymentMethod?: UIElement;
    /**
     * Map that keeps track of which Payment methods (UIElements) already got rendered in the UI
     */
    cachedPaymentMethods: Record<string, boolean>;
    showRemovePaymentMethodButton?: boolean;
    onSelect?: (paymentMethod: UIElement) => void;
    onDisableStoredPaymentMethod?: (storedPaymentMethod) => void;
    isDisablingPaymentMethod?: boolean;
    isLoading: boolean;
}

function PaymentMethodsContainer({
    label,
    classNameModifiers = [],
    paymentMethods,
    activePaymentMethod,
    cachedPaymentMethods,
    showRemovePaymentMethodButton,
    onSelect,
    onDisableStoredPaymentMethod,
    isDisablingPaymentMethod,
    isLoading
}: PaymentMethodsContainerProps) {
    const { i18n } = useCoreContext();
    const selectListId: string = useMemo(() => `select-${uuid()}`, []);
    const paymentMethodListClassnames = classNames([
        'adyen-checkout__payment-methods-list',
        { 'adyen-checkout__payment-methods-list--loading': isLoading },
        ...classNameModifiers.map(m => `adyen-checkout__payment-methods-list--${m}`)
    ]);

    return (
        <div className="adyen-checkout-payment-methods-container">
            {!!label.length && (
                <label htmlFor={selectListId} className="adyen-checkout-payment-methods-list-label">
                    {label}
                </label>
            )}
            <ul
                id={selectListId}
                className={paymentMethodListClassnames}
                role="radiogroup"
                aria-label={i18n.get('paymentMethodsList.aria.label')}
                required
            >
                {paymentMethods.map((paymentMethod, index, paymentMethodsCollection) => {
                    const isSelected = activePaymentMethod && activePaymentMethod._id === paymentMethod._id;
                    const isLoaded = paymentMethod._id in cachedPaymentMethods;
                    const isNextOneSelected =
                        activePaymentMethod &&
                        paymentMethodsCollection[index + 1] &&
                        activePaymentMethod._id === paymentMethodsCollection[index + 1]._id;

                    return (
                        <PaymentMethodItem
                            className={classNames({ 'adyen-checkout__payment-method--next-selected': isNextOneSelected })}
                            standalone={paymentMethods.length === 1}
                            paymentMethod={paymentMethod}
                            isSelected={isSelected}
                            isDisablingPaymentMethod={isSelected && isDisablingPaymentMethod}
                            isLoaded={isLoaded}
                            isLoading={isLoading}
                            onSelect={onSelect}
                            key={paymentMethod._id}
                            showRemovePaymentMethodButton={showRemovePaymentMethodButton}
                            onDisableStoredPaymentMethod={onDisableStoredPaymentMethod}
                        />
                    );
                })}
            </ul>
        </div>
    );
}

export default PaymentMethodsContainer;
