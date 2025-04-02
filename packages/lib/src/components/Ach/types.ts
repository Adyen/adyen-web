import { UIElementProps } from '../internal/UIElement/types';

export interface AchConfiguration extends UIElementProps {
    storedPaymentMethodId?: string;
    holderNameRequired?: boolean;
    hasHolderName?: boolean;
    enableStoreDetails?: boolean;
    bankAccountNumber?: string; // Applies when a storedPM
    placeholders?: AchPlaceholders;
}

export interface AchPlaceholders {
    accountTypeSelector?: string;
    ownerName?: string;
    routingNumber?: string;
    accountNumber?: string;
    accountNumberVerification?: string;
}
