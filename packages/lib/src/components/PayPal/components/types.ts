import type { PayPalButtonOnError, PayPalNamespace } from '@paypal/paypal-js';

import type { PayPalConfiguration } from '../types';
import type {
    PayPalOnApproveActions,
    PayPalOnApproveData,
    PayPalOnShippingAddressChangeData,
    PayPalOnShippingOptionsChangeData,
    PayPalV6OnApproveData,
    PayPalV6OnShippingAddressChangeData,
    PayPalV6OnShippingOptionsChangeData
} from '../paypal-js-types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { ComponentMethodsRef } from '../../types';
import { PayPalService } from '../services/PayPalService';

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
    paypalRef?: PayPalNamespace | null;
    isProcessingPayment: boolean;
}

export type PayPalComponentV6Props = Pick<
    NonNullable<PayPalConfiguration['usePayPalV6']>,
    'commit' | 'vault' | 'style' | 'blockPayPalCreditButton' | 'blockPayPalPayLaterButton' | 'blockPayPalVenmoButton' | 'presentationModeOptions'
> & {
    paypalService: PayPalService;
    onSubmit: () => Promise<string>;
    onApprove: (data: PayPalV6OnApproveData) => Promise<void>;
    onShippingAddressChange: (data: PayPalV6OnShippingAddressChangeData) => Promise<void>;
    onShippingOptionsChange: (data: PayPalV6OnShippingOptionsChangeData) => Promise<void>;
    onCancel: () => void;
    onError: (error: Error) => void;
    setComponentRef: (ref: ComponentMethodsRef) => void;
};
