import type { AdyenCheckoutError, StatusFromAction, UIElement, UIElementProps } from '../../../types';
import type { PaymentAction } from '../../../types/global-types';

export type ActionHandlerConfig = UIElementProps &
    PaymentAction & {
        readonly onError?: (error: AdyenCheckoutError, element?: UIElement) => void;
        readonly statusType: StatusFromAction;
        readonly originalAction: PaymentAction;
    };
