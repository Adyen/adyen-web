import { TxVariants } from '../tx-variants';
import { UIElementProps } from '../internal/UIElement/types';
import { IssuerItem } from '../internal/IssuerList/types';
import { SendAnalyticsObject } from '../../core/Analytics/types';

export type RiskSignals = {
    isRootedDevice?: boolean;
    screenBrightness?: number;
    elapsedTimeSinceBoot?: number;
    osVersion?: string;
    userTimeZoneOffset?: number;
    language?: string;
    screenDimensions?: { width?: number; height?: number };
};

export interface PayByBankPixConfiguration extends UIElementProps {
    /**
     * Risk related information, optionally pass may increase the conversion rate
     * todo: check with sarah for the complete list
     */
    riskSignals?: RiskSignals;
    deviceId?: string;
    /**
     * Redirect url to issuer's app to confirm the mandate
     * @internal
     */
    type?: 'await' | 'redirect';
    url?: string;
    statusCheckUrl?: string;
    /**
     * Await component
     * @internal
     */
    paymentData?: string;
    /** Issuer component
     * @internal
     */
    issuers?: IssuerItem[];
    /**
     * @internal
     */
    _isNativeFlow?: boolean;
    /**
     * @internal
     */
    onSubmitAnalytics: (aObj: SendAnalyticsObject) => void;
}

export interface PayByBankPixData {
    paymentMethod: {
        type: TxVariants.paybybank_pix;
        subType: 'redirect' | 'embedded';
        riskSignals?: RiskSignals;
    };
}
