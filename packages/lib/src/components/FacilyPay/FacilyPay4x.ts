import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';
import { TxVariants } from '../tx-variants';

export default class FacilyPay4x extends OpenInvoiceContainer {
    public static type = TxVariants.facilypay_4x;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
