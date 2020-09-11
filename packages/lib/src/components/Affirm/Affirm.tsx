import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';

const ALLOWED_COUNTRIES = ['CA', 'US'];

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
