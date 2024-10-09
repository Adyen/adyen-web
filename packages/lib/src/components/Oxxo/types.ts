import { ActionHandledReturnObject, PaymentAction, PaymentAmount } from '../../types/global-types';

export interface OxxoVoucherResultProps {
    alternativeReference?: string;
    reference?: string;
    expiresAt?: string;
    merchantReference?: string;
    totalAmount?: PaymentAmount;
    paymentMethodType?: string;
    downloadUrl?: string;
    ref?: any;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    originalAction?: PaymentAction;
}
