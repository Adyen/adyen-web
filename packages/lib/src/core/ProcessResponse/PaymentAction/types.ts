import type { AdyenCheckoutError, StatusFromAction, UIElement } from '../../../types';
import type { PaymentAction } from '../../../types/global-types';

export type ActionHandlerConfig<T = any> = {
    readonly [key in keyof T]: T[key]; // relates to the props object passed to the getActionHandler function in actionTypes.ts
} & {
    readonly [key in keyof PaymentAction]: PaymentAction[key];
} & {
    readonly onError?: (error: AdyenCheckoutError, element?: UIElement) => void;
    readonly statusType: StatusFromAction;
    readonly originalAction: PaymentAction;
};
