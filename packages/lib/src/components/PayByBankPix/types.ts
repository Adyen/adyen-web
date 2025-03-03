import { TxVariants } from '../tx-variants';
import { PayByBankPixProps } from './components/PayByBankPix/types';

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

export type PayByBankPixConfiguration = Omit<Partial<PayByBankPixProps>, 'txVariant'> & {
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
