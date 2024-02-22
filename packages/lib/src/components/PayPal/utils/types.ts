import { Intent } from '../types';
import { SUPPORTED_LOCALES } from '../config';

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

export type PayPalSupportedLocale = (typeof SUPPORTED_LOCALES)[number];
