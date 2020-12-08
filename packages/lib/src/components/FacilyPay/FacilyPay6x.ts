import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';

export default class FacilyPay6x extends OpenInvoiceContainer {
    public static type = 'facilypay_6x';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
