import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';
import { TxVariants } from '../tx-variants';

export default class Affirm extends OpenInvoiceContainer {
    public static type = TxVariants.affirm;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: ALLOWED_COUNTRIES,
            personalDetailsRequiredFields: ['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']
        };
    }
}
