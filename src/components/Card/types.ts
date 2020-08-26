import { UIElementProps } from '../UIElement';
import { AddressSchema } from '../../types';

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
    configuration?: CardConfiguration;
    [key: string]: any;
}

export interface CardConfiguration {
    koreanAuthenticationRequired?: boolean;
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

interface BrowserInfo {
    acceptHeader: string;
    colorDepth: string;
    language: string;
    javaEnabled: boolean;
    screenHeight: string;
    screenWidth: string;
    userAgent: string;
    timeZoneOffset: number;
}

export interface CardElementData {
    paymentMethod: CardPaymentMethodData;
    billingAddress?: AddressSchema;
    installments?: { value: number };
    storePaymentMethod?: boolean;
    browserInfo: BrowserInfo;
}
