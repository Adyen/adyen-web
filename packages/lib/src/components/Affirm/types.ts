import { OpenInvoiceConfiguration } from '../helpers/OpenInvoiceContainer/types';

export interface AffirmConfiguration extends OpenInvoiceConfiguration {
    allowedCountries?: string[];
}
