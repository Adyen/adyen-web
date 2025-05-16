import { TxVariants } from '../tx-variants';
import { UIElementProps } from '../internal/UIElement/types';
import { AwaitProps, IssuerListProps } from './components/Enrollment/types';
import { PaymentProps } from './components/StoredPayment/types';

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
    Partial<Omit<AwaitProps, 'enrollmentId'>> &
    Partial<IssuerListProps> &
    Partial<Omit<PaymentProps, 'enrollmentId' | 'initiationId'>> & {
        // Merchant will pass it when HC is ready to forward it
        deviceId?: string;
        /**
         * @internal
         */
        _isAdyenHosted?: boolean;
        /**
         * @internal from backend, action object
         */
        paymentMethodData?: { enrollmentId: string; initiationId?: string };
        /**
         * @internal from backend, paymentMethods storedPaymentMethod response
         */
        payByBankPixDetails?: { deviceId: string; receiver: string; ispb: string };
    };

export interface PayByBankPixData {
    paymentMethod: {
        type: TxVariants.paybybank_pix;
        issuer?: string;
        riskSignals?: RiskSignals;
    };
}
