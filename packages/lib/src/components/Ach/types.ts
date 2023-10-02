import { UIElementProps } from '../types';
import { Placeholders } from './components/AchInput/types';

export interface AchElementProps extends UIElementProps {
    storedPaymentMethodId?: string;
    holderNameRequired?: boolean;
    hasHolderName?: boolean;
    enableStoreDetails: boolean;
    bankAccountNumber: string;
    showFormInstruction?: boolean;
    placeholders?: Placeholders;
}
