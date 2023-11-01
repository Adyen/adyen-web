import { UIElementProps } from '../internal/UIElement/types';

export interface BankTransferConfiguration extends UIElementProps {
    reference?: string;

    /**
     * Show/hide email address field
     * @default true
     */
    showEmailAddress?: boolean;
}

export interface BankTransferState extends UIElementProps {
    data: {
        shopperEmail?: string;
    };
    isValid: boolean;
}

export interface BankTransferSchema {
    shopperEmail?: string;
}
