import { BrowserInfo } from '../../types/global-types';
import { ClickToPayProps as ClickToPayProps } from '../internal/ClickToPay/types';
import { ClickToPayCheckoutPayload } from '../internal/ClickToPay/services/types';
import { UIElementProps } from '../internal/UIElement/types';

export type ClickToPayConfiguration = UIElementProps &
    ClickToPayProps & {
        /**
         * ClickToPay configuration sent by the /paymentMethods response
         */
        configuration?: {
            mcDpaId?: string;
            mcSrcClientId?: string;
            visaSrcInitiatorId?: string;
            visaSrciDpaId?: string;
        };
    };

export type ClickToPayPaymentData = {
    paymentMethod: ClickToPayCheckoutPayload & {
        type: string;
    };
    origin: string;
    browserInfo: BrowserInfo;
};
