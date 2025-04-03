import { UIElementProps } from '../internal/UIElement/types';

export interface AchConfiguration extends UIElementProps {
    placeholders?: AchPlaceholders;
    holderNameRequired?: boolean;
    hasHolderName?: boolean;
    /**
     * Enables storing the payment method using the Checkbox
     */
    enableStoreDetails?: boolean;
    /**
     * storedPaymentMethodId coming from a stored ACH in /paymentMethods response
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
