import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';

export default class FacilyPay3x extends OpenInvoiceContainer {
    public static type = 'facilypay_3x';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
