import { TxVariants } from '../tx-variants';
import { UIElementProps } from '../internal/UIElement/types';
import { IssuerItem } from '../internal/IssuerList/types';

export type RiskSignals = {
    deviceId?: string;
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
     * Risk related information, merchant can optionally pass those to use in order to increase the conversion rate
     * todo: check with sarah for the complete list
     */
    riskSignals?: RiskSignals;
    /**
     * Redirect url to issuer's app to confirm the mandate
     * @internal
     */
    type?: 'await' | 'redirect';
    url?: string;
    /**
     * await component
     * @internal
     */
    paymentData?: string;
    /**
     * @internal
     */
    issuers?: IssuerItem[];
    /**
     * @internal
     */
    _isNativeFlow?: boolean;
}

export interface PayByBankPixData {
    paymentMethod: {
        type: TxVariants.paybybank_pix;
        subType: 'redirect' | 'embedded';
        riskSignals?: RiskSignals;
    };
}
