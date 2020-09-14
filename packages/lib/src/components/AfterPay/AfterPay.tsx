import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import ConsentCheckboxLabel from './components/ConsentCheckboxLabel';

export default class AfterPay extends OpenInvoiceContainer {
    public static type = 'afterpay_default';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            consentCheckboxLabel: <ConsentCheckboxLabel {...props} />
        };
    }
}
