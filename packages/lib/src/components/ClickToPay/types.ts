import { UIElementProps } from '../types';
import { BrowserInfo } from '../../types';
import { ClickToPayConfiguration } from '../internal/ClickToPay/types';
import { ClickToPayCheckoutPayload } from '../internal/ClickToPay/services/types';

export type ClickToPayElementProps = UIElementProps &
    ClickToPayConfiguration & {
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
