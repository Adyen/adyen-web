import { UIElementProps } from '../types';
import { ClickToPayConfiguration } from '../Card/types';

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
