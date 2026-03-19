import { UIElementProps } from '../internal/UIElement/types';

export interface PayPayConfiguration extends UIElementProps {
    configuration: {
        clientId: string;
        merchantId: string;
    };
}

export type PayPayInitOptions = {
    clientId: string;
    env: 'sandbox' | 'production';
    success: (res: unknown) => void;
    fail: (res: unknown) => void;
};

export type PayPayAuthStatusOptions = {
    success: (res: unknown) => void;
    fail: (res: unknown) => void;
};

export type PayPayRenderButtonLoginOptions = {
    containerId: string;
    locale: 'ja' | 'en';
    postLoginRedirectUrl?: string;
};

export type PayPayRenderButtonPaymentOptions = {
    containerId: string;
    locale: 'ja' | 'en';
    buttonSize?: 'lg' | 'sm';
    theme?: 'light' | 'dark' | 'red';
    isShortText?: boolean;
    autoInvoke?: boolean;
    orderInfo: {
        merchantPaymentId: string;
        merchantAlias: string;
        amount: {
            amount: number;
            currency: string;
        };
        productType: 'DEFAULT';
        requestedAt: number;
    };
    callbacks: {
        onPaymentSuccess: (result: unknown) => void;
        onPaymentFailure: (error: unknown) => void;
        onPaymentCompletion: () => void;
    };
    success: (res: unknown) => void;
    fail: (res: unknown) => void;
};
