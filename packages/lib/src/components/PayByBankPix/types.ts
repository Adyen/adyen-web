import { TxVariants } from '../tx-variants';
import { UIElementProps } from '../internal/UIElement/types';
import { AwaitProps, IssuerListProps } from './components/Enrollment/types';
import { PaymentProps } from './components/Payment/types';

export type RiskSignals = {
    osVersion?: string;
    userTimeZoneOffset?: string;
    language?: string;
    screenDimensions?: { width: number; height: number };
    /**
     * The following properties won't be collected by the sdk, optionally passed by merchant.
     */
    isRootedDevice?: boolean;
    screenBrightness?: number;
    elapsedTimeSinceBoot?: number;
};

export type PayByBankPixConfiguration = UIElementProps &
    Partial<AwaitProps> &
    Partial<IssuerListProps> &
    Partial<PaymentProps> & {
        // Merchant will pass it when HC is ready to forward it
        deviceId?: string;
        /**
         * @internal
         */
        _isAdyenHosted?: boolean;
    };

export interface PayByBankPixData {
    paymentMethod: {
        type: TxVariants.paybybank_pix;
        issuer?: string;
        riskSignals?: RiskSignals;
    };
}
