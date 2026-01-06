import { ActionHandledReturnObject, PaymentAmount, PersonalDetailsSchema } from '../../types/global-types';
import { UIElementProps } from '../internal/UIElement/types';

export interface EcontextVoucherResultProps {
    reference?: string;
    totalAmount?: PaymentAmount;
    expiresAt?: string;
    paymentMethodType?: string;
    maskedTelephoneNumber?: string;
    instructionsUrl?: string;
    alternativeReference?: string;
    collectionInstitutionNumber?: string;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
}

export interface EcontextInputSchema {
    firstName?: string;
    lastName?: string;
    telephoneNumber?: string;
    shopperEmail?: string;
}

export interface EcontextConfiguration extends UIElementProps {
    personalDetailsRequired?: boolean;
    data?: PersonalDetailsSchema;
    reference?: string;
    totalAmount?: PaymentAmount;
    expiresAt?: string;
    paymentMethodType?: string;
    maskedTelephoneNumber?: string;
    instructionsUrl?: string;
    alternativeReference?: string;
    collectionInstitutionNumber?: string;
}
