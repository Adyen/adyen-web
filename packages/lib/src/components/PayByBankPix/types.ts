import { TxVariants } from '../tx-variants';
import { PayByBankPixProps } from './components/PayByBankPix/types';

export type RiskSignals = {
    osVersion?: string;
    userTimeZoneOffset?: number;
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
     * Risk related information, optionally pass may increase the conversion rate
     */
    riskSignals?: RiskSignals;
    deviceId?: string;
    /**
     * @internal
     */
    _isNativeFlow?: boolean;
};

export interface PayByBankPixData {
    paymentMethod: {
        type: TxVariants.paybybank_pix;
        riskSignals?: RiskSignals;
    };
    returnUrl?: string; // todo:remove it testing purpose
}
