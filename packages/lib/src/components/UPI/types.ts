import { UIElementProps } from '../internal/UIElement/types';
import { TxVariants } from '../tx-variants';
import { SegmentedControlOption } from '../internal/SegmentedControl/SegmentedControl';
import { Mandate } from './components/UPIMandate/UPIMandate';

export type UpiType = TxVariants.upi_qr | TxVariants.upi_intent | TxVariants.upi_collect;

export type UpiMode = 'vpa' | 'qrCode' | 'intent';

export type App = { id: string; name: string; type?: UpiType };

export type UpiPaymentData = {
    paymentMethod: {
        type: UpiType;
        virtualPaymentAddress?: string;
        appId?: string;
    };
};

export interface UPIConfiguration extends UIElementProps {
    defaultMode?: UpiMode;
    // upi autopay
    mandate?: Mandate;
    // upi_intent
    apps?: Array<App>;
    /**
     * Redirect url for upi intent apps
     * @internal
     */
    url?: string;
    /**
     * @internal
     */
    segmentedControlOptions?: Array<SegmentedControlOption<UpiMode>>;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
    /**
     * The duration in minutes before the await/QR code expires.
     */
    countdownTime?: number;
}
