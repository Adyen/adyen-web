import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';

export default class Affirm extends OpenInvoiceContainer {
    public static type = 'affirm';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            personalDetailsRequiredFields: ['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']
        };
    }
}
