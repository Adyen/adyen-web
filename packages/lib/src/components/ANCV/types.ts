import { UIElementProps } from '../internal/UIElement/types';

export interface ANCVConfiguration extends UIElementProps {
    paymentData?: any;
    data: ANCVDataState;
    onOrderRequest?: any;
    onOrderUpdated?: any;
}

export interface ANCVDataState {
    beneficiaryId: string;
}
