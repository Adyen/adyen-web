import { UIElementProps } from '../types';
import { ClickToPayConfiguration } from '../Card/types';
import { ClickToPayCheckoutPayload } from '../Card/components/ClickToPay/services/types';
import { BrowserInfo } from '../../types';

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
