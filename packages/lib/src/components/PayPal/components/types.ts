import type { PayPalConfiguration } from '../types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';

export interface PayPalComponentProps extends PayPalConfiguration {
    onApprove: (data: any, actions: any) => void;
    onCancel: () => void;
    onChange: (newState: any) => void;
    onError: (data: any) => void;
    onSubmit: () => Promise<any>;
    ref?: any;
    onScriptLoadFailure(error: AdyenCheckoutError): void;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping address they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingaddresschange}
     */
    onShippingAddressChange?: (data: any, actions: { reject: (reason?: string) => Promise<void> }) => Promise<void>;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping options they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingoptionschange}
     */
    onShippingOptionsChange?: (data: any, actions: { reject: (reason?: string) => Promise<void> }) => Promise<void>;
}

export interface PayPalButtonsProps extends Omit<PayPalComponentProps, 'ref' | 'onScriptLoadFailure'> {
    paypalRef: any;
    isProcessingPayment: boolean;
}
