import { CVCPolicyType, DatePolicyType } from '../lib/types';
import { AddressData } from '../../../../types';

export interface SFPState {
    status?: string;
    brand?: string;
    errors?: object;
    valid: object;
    data: object;
    cvcPolicy?: CVCPolicyType;
    isSfpValid?: boolean;
    autoCompleteName?: string;
    billingAddress?: AddressData;
    hasUnsupportedCard?: boolean;
    hasKoreanFields?: boolean;
    showSocialSecurityNumber?: boolean;
    expiryDatePolicy?: DatePolicyType;
    socialSecurityNumber?: string;
}

export interface SingleBrandResetObject {
    brand: string;
    cvcPolicy: CVCPolicyType;
}
