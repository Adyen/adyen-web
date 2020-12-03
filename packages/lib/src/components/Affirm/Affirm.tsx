import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ALLOWED_COUNTRIES } from './config';

export default class Affirm extends OpenInvoiceContainer {
    public static type = 'affirm';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: ALLOWED_COUNTRIES,
            personalDetailsRequiredFields: ['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']
        };
    }
}
