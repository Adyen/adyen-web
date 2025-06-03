import { UIElementProps } from '../internal/UIElement/types';

export interface PreAuthorizedDebitCanadaConfiguration extends UIElementProps {
    /**
     * Adds placeholder text to the input fields
     */
    placeholders?: PreAuthorizedDebitCanadaPlaceholders;
    /**
     * Display the contextual text underneath the input field. Disable it if you are using placeholders instead
     * @default true
     */
    showContextualElement?: boolean;
    /**
     * Enables storing the payment method using the Checkbox. Used for Advanced flow only
     * @default false
     */
    enableStoreDetails?: boolean;
    /**
     * 'storedPaymentMethodId' coming from a stored PreAuthorizedDebitCanada in /paymentMethods response
     * @internal
     */
    storedPaymentMethodId?: string;
    /**
     * 'lastFour' coming from a stored PreAuthorizedDebitCanada in /paymentMethods response
     * @internal
     */
    lastFour?: string;
    /**
     * 'label' coming from a stored PreAuthorizedDebitCanada in /paymentMethods response
     * @internal
     */
    label?: string;
}

export interface PreAuthorizedDebitCanadaPlaceholders {
    ownerName?: string;
    bankAccountNumber?: string;
    bankCode?: string;
    bankLocationId?: string;
}
