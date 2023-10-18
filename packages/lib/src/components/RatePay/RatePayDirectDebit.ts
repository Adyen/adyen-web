import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';
import { TxVariants } from '../tx-variants';

export default class RatePayDirectDebit extends OpenInvoiceContainer {
    public static type = TxVariants.ratepay_directdebit;

    formatProps(props) {
        return {
            ...super.formatProps({ ...props, ...{ visibility: { bankAccount: 'editable' } } }),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
