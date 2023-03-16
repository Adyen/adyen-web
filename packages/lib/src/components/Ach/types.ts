import { UIElementProps } from '../types';

export interface AchElementProps extends UIElementProps {
    storedPaymentMethodId?: string;
    holderNameRequired?: boolean;
    hasHolderName?: boolean;
    enableStoreDetails: boolean;
    bankAccountNumber: string;
}
