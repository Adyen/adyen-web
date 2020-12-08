import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';

export default class FacilyPay4x extends OpenInvoiceContainer {
    public static type = 'facilypay_4x';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
