import { UIElementProps } from '../UIElement';

export interface BankTransferProps extends UIElementProps {
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
