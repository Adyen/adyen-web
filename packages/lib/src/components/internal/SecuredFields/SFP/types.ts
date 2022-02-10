import { CVCPolicyType, DatePolicyType } from '../lib/types';
import { AddressData } from '../../../../types';

export interface SFPState {
    status?: string;
    brand?: string;
    errors?: object;
    valid: SFPValid;
    data: object;
    cvcPolicy?: CVCPolicyType;
    isSfpValid?: boolean;
    autoCompleteName?: string;
    billingAddress?: AddressData;
    detectedUnsupportedCardsArray?: string[];
    hasKoreanFields?: boolean;
    showSocialSecurityNumber?: boolean;
    expiryDatePolicy?: DatePolicyType;
    socialSecurityNumber?: string;
}

export interface SingleBrandResetObject {
    brand: string;
    cvcPolicy: CVCPolicyType;
}

export interface SFPValid {
    encryptedCardNumber?: boolean;
    encryptedExpiryMonth?: boolean;
    encryptedExpiryYear?: boolean;
    encryptedSecurityCode?: boolean;
    encryptedPassword?: boolean;
    encryptedPin?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}
