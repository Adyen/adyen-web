import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';

export default class RatePayDirectDebit extends OpenInvoiceContainer {
    public static type = 'ratepay_directdebit';

    formatProps(props) {
        return {
            ...super.formatProps({ ...props, ...{ visibility: { bankAccount: 'editable' } } }),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
