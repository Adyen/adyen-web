import { OpenInvoiceConfiguration } from '../helpers/OpenInvoiceContainer/types';
import type { ALLOWED_COUNTRIES } from './config';

export interface AffirmConfiguration extends OpenInvoiceConfiguration {
    allowedCountries?: (typeof ALLOWED_COUNTRIES)[number][];
}
