import { PaymentAmount } from '~/types';
import UIElement, { UIElementProps } from '../UIElement';

declare global {
    interface Window {
        paypal: object;
    }
}

type Intent = 'sale' | 'capture' | 'authorize' | 'order';

interface PayPalStyles {
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    height?: string | number;
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
    tagline?: boolean;
    layout?: 'vertical' | 'horizontal';
}

interface PayPalCommonProps {
    environment?: string;
    status?: string;
    merchantId?: string;
    intent?: Intent;
    style?: PayPalStyles;
    onInit?: (data?: object, actions?: object) => void;
    onClick?: () => void;
}

export interface PayPalElementProps extends PayPalCommonProps, UIElementProps {
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element?: UIElement) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onCancel?: (state: any, element: UIElement) => void;
    onError?: (state: any, element: UIElement) => void;
}

export interface PayPalComponentProps extends PayPalCommonProps {
    onCancel?: (data: object) => void;
    onChange?: (newState: object) => void;
    onComplete?: (details: object) => void;
    onError?: (data: object) => void;
    onSubmit?: () => Promise<any>;
    ref?: any;
}

export interface PayPalButtonsProps extends PayPalComponentProps {
    paypalRef: any;
}

export interface PaypalSettingsProps {
    amount?: PaymentAmount;
    countryCode?: string;
    environment: string;
    intent?: Intent;
    locale?: string;
    merchantId?: string;
}

export interface PaypalSettings {
    'merchant-id'?: string;
    locale?: string;
    'buyer-country': string;
    currency?: string;
    intent?: Intent;
    'client-id': string;
    'integration-date': string;
    components: string;
}
