import type { PayPalButtonOnError, PayPalNamespace } from '@paypal/paypal-js';

import type {
    PayPalConfiguration,
    PayPalOnApproveActions,
    PayPalOnApproveData,
    PayPalOnShippingAddressChangeData,
    PayPalOnShippingOptionsChangeData
} from '../types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { ComponentMethodsRef } from '../../types';

export interface PayPalComponentProps extends Omit<PayPalConfiguration, 'onError' | 'onSubmit'> {
    onApprove: (data: PayPalOnApproveData, actions: PayPalOnApproveActions) => Promise<void>;
    onCancel: () => void;
    onError: PayPalButtonOnError;
    onSubmit: () => Promise<string>;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    onScriptLoadFailure(error: AdyenCheckoutError): void;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping address they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingaddresschange}
     */
    onShippingAddressChange?: (data: PayPalOnShippingAddressChangeData, actions: { reject: (reason?: string) => Promise<void> }) => Promise<void>;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping options they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingoptionschange}
     */
    onShippingOptionsChange?: (data: PayPalOnShippingOptionsChangeData, actions: { reject: (reason?: string) => Promise<void> }) => Promise<void>;
}

export interface PayPalButtonsProps extends Omit<PayPalComponentProps, 'ref' | 'onScriptLoadFailure' | 'setComponentRef'> {
    paypalRef: PayPalNamespace;
    isProcessingPayment: boolean;
}
