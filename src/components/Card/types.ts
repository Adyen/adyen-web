import { UIElementProps } from '../UIElement';
import { Address, BrowserInfo } from '../../types';

export interface CardElementProps extends UIElementProps {
    type?: string;
    brand?: string;

    /** @deprecated use brands instead */
    groupTypes?: string[];

    brands?: string[];
    enableStoreDetails?: boolean;
    hideCVC?: boolean;
    hasHolderName?: boolean;
    holderNameRequired?: boolean;
    [key: string]: any;
}

interface CardPaymentMethodData {
    type: string;
    brand?: string;
    storedPaymentMethodId?: string;
    fundingSource?: string;
    holderName?: string;
    encryptedCardNumber?: string;
    encryptedExpiryMonth?: string;
    encryptedExpiryYear?: string;
    encryptedSecurityCode?: string;
}

export interface CardElementData {
    paymentMethod: CardPaymentMethodData;
    billingAddress?: Address;
    installments?: { value: number };
    storePaymentMethod?: boolean;
    browserInfo: BrowserInfo;
}
