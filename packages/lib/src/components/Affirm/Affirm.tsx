import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES, DEFAULT_COUNTRIES } from './config';
import { TxVariants } from '../tx-variants';
import type { AffirmConfiguration } from './types';

export default class Affirm extends OpenInvoiceContainer {
    public static readonly type = TxVariants.affirm;

    formatProps(props: AffirmConfiguration) {
        const allowedCountries = props.allowedCountries?.filter(country => ALLOWED_COUNTRIES.includes(country)) || DEFAULT_COUNTRIES;
        const countryCode = allowedCountries.some(country => country === props.countryCode) ? props.countryCode : allowedCountries[0];

        return {
            ...super.formatProps({ ...props, countryCode }),
            allowedCountries,
            personalDetailsRequiredFields: ['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']
        };
    }
}
