import { Placeholders } from './components/AchInput/types';
import { UIElementProps } from '../internal/UIElement/types';

export interface AchConfiguration extends UIElementProps {
    storedPaymentMethodId?: string;
    holderNameRequired?: boolean;
    hasHolderName?: boolean;
    enableStoreDetails: boolean;
    bankAccountNumber: string;
    showFormInstruction?: boolean;
    placeholders?: Placeholders;
}
