import { UIElementProps } from '../internal/UIElement/types';
import { BankTransferResultProps } from './components/BankTransferResult/BankTransferResult';

export type BankTransferConfiguration = UIElementProps &
    BankTransferResultProps & {
        /**
         * Show/hide email address field
         * @default true
         */
        showEmailAddress?: boolean;
    };

export interface BankTransferState extends UIElementProps {
    data: {
        shopperEmail?: string;
    };
    isValid: boolean;
}

export interface BankTransferSchema {
    shopperEmail?: string;
}
