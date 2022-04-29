import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { ATOME_SUPPORTED_COUNTRIES, BILLING_ADDRESS_SPECIFICATION } from './config';

export default class Atome extends OpenInvoiceContainer {
    public static type = 'atome';

    formatProps(props) {
        return {
            ...super.formatProps({ ...props, ...{ visibility: { deliveryAddress: 'hidden', companyDetails: 'hidden' } } }),
            allowedCountries: ATOME_SUPPORTED_COUNTRIES,
            personalDetailsRequiredFields: ['firstName', 'lastName', 'telephoneNumber'],
            billingAddressRequiredFields: ['country', 'street', 'postalCode'],
            billingAddressSpecification: BILLING_ADDRESS_SPECIFICATION
        };
    }
}
