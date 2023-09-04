import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';
import { TxVariants } from '../tx-variants';

export default class RatePay extends OpenInvoiceContainer {
    public static type = TxVariants.ratepay;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
