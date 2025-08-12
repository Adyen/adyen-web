import type { UIElementProps } from '../internal/UIElement/types';
import type { AchFormPrefillData } from './components/AchComponent';

export interface AchConfiguration extends UIElementProps {
    /**
     * Pre-fill ACH form with shopper data
     */
    data?: AchFormPrefillData;
    /**
     * Adds placeholder text to the input fields
     */
    placeholders?: AchPlaceholders;
    /**
     * Set to false to hide the "Account Holder Name" field if you want to pass the data yourself
     * @default true
     */
    hasHolderName?: boolean;
    /**
     * Enables storing the payment method using the Checkbox
     * @default false
     */
    enableStoreDetails?: boolean;
    /**
     * storedPaymentMethodId coming from a stored ACH in /paymentMethods response
     * @internal
     */
    storedPaymentMethodId?: string;
    /**
     * bankAccountNumber coming from a stored ACH in /paymentMethods response
     * @internal
     */
    bankAccountNumber?: string;
}

export interface AchPlaceholders {
    accountTypeSelector?: string;
    ownerName?: string;
    routingNumber?: string;
    accountNumber?: string;
    accountNumberVerification?: string;
}
