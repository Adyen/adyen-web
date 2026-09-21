import { UIElementProps } from '../internal/UIElement/types';

export interface SepaElementData {
    paymentMethod: {
        type: string;
        iban: string;
        ownerName: string;
    };
}

export interface SepaConfiguration extends UIElementProps {}
