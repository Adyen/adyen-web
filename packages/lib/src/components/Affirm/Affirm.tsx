import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';
import TxVariant from './tx-variant';

export default class Affirm extends OpenInvoiceContainer {
    public static type = TxVariant.defaultTxVariant;
    public static txVariants = TxVariant.txVariants;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: ALLOWED_COUNTRIES,
            personalDetailsRequiredFields: ['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']
        };
    }
}
