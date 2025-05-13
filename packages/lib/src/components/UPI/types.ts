import { UIElementProps } from '../internal/UIElement/types';
import { TxVariants } from '../tx-variants';

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
    /**
     * Callback used to validate the VPA ID before making the payments call.
     * actions.resolve() should be called if VPA is valid. Otherwise, actions.reject() to display an error message
     *
     * @param validationData
     * @param actions
     */
    onVpaValidation?(validationData: { type: string; virtualPaymentAddress: string }, actions: { resolve(): void; reject(): void }): void;
    /**
     * Adds placeholder text to the input fields
     */
    placeholders?: {
        virtualPaymentAddress?: string;
    };
    /**
     * Display the contextual text underneath the input field. Disable it if you are using placeholders instead
     * @default true
     */
    showContextualElement?: boolean;

    defaultMode?: UpiMode;
    // upi_intent
    apps?: Array<App>;
    /**
     * Redirect url for upi intent apps
     * @internal
     */
    url?: string;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
}
