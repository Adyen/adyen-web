import { Placeholders } from './components/AchInput/types';
import { UIElementProps } from '../internal/UIElement/types';
import { AddressData } from '../../types/global-types';

export interface AchConfiguration extends UIElementProps {
    storedPaymentMethodId?: string;
    holderNameRequired?: boolean;
    hasHolderName?: boolean;
    enableStoreDetails: boolean;
    bankAccountNumber?: string; // Applies when a storedComp
    placeholders?: Placeholders;
    /**
     * Object that contains placeholder information that you can use to prefill fields.
     * - merchant set config option
     */
    data?: {
        holderName?: string;
        billingAddress?: Partial<AddressData>;
    };
}
