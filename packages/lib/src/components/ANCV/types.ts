import { UIElementProps } from '../internal/UIElement/types';
import { onOrderRequestCallbackType, onOrderUpdatedCallbackType } from '../types';

export interface ANCVConfiguration extends UIElementProps {
    paymentData?: string;
    data: ANCVDataState;
    onOrderRequest?: onOrderRequestCallbackType;
    onOrderUpdated?: onOrderUpdatedCallbackType;
}

export interface ANCVDataState {
    beneficiaryId: string;
}
