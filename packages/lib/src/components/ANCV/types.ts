import { UIElementProps } from '../internal/UIElement/types';

export interface ANCVConfiguration extends UIElementProps {
    paymentData?: any;
    data: ANCVDataState;
    onOrderRequest?: any;
    onOrderCreated?: any;
}

export interface ANCVDataState {
    beneficiaryId: string;
}
