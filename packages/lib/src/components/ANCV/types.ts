import { UIElementProps } from '../internal/UIElement/types';
import type { PaymentAction } from '../../types/global-types';

export interface ANCVConfiguration extends UIElementProps {
    paymentData?: any;
    data: ANCVDataState;
    onOrderRequest?: any;
    onOrderUpdated?: any;
    originalAction?: PaymentAction;
}

export interface ANCVDataState {
    beneficiaryId: string;
}
