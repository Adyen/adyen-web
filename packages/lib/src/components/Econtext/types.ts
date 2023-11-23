import { PaymentAmount, PersonalDetailsSchema } from '../../types/global-types';
import { UIElementProps } from '../internal/UIElement/types';

export interface EcontextVoucherResultProps {
    reference?: string;
    totalAmount?: PaymentAmount;
    expiresAt?: string;
    paymentMethodType?: string;
    maskedTelephoneNumber?: string;
    instructionsUrl?: string;
    ref?: any;
    collectionInstitutionNumber?: string;
}

export interface EcontextInputSchema {
    firstName?: string;
    lastName?: string;
    telephoneNumber?: string;
    shopperEmail?: string;
}

export interface EcontextConfiguration extends UIElementProps {
    reference?: string;
    personalDetailsRequired?: boolean;
    data?: PersonalDetailsSchema;
    showFormInstruction?: boolean;
}
