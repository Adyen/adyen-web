import { UIElementProps } from '../internal/UIElement/types';
import { BankTransferInputProps } from './components/BankTransferInput/types';

export type BankTransferConfiguration = UIElementProps &
    Partial<Omit<BankTransferInputProps, 'onChange' | 'ref'>> & {
        reference?: string;

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
