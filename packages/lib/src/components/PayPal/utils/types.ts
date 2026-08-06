import { Intent } from '../types';
import { SUPPORTED_LOCALES_PAYPAL_V5, SUPPORTED_LOCALES_PAYPAL_V6 } from '../config';

export interface PaypalSettings {
    'merchant-id'?: string;
    locale?: string;
    'buyer-country': string;
    currency?: string;
    debug?: boolean;
    intent?: Intent;
    commit?: boolean;
    vault?: boolean;
    'client-id': string;
    'integration-date': string;
    'enable-funding': string;
    components: string;
}

export type PayPalV5SupportedLocale = (typeof SUPPORTED_LOCALES_PAYPAL_V5)[number];
export type PayPalV6SupportedLocale = (typeof SUPPORTED_LOCALES_PAYPAL_V6)[number];
