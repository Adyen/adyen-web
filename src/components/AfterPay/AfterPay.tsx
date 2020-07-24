import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import ConsentCheckbox from './components/ConsentCheckbox';

export default class AfterPay extends OpenInvoiceContainer {
    public static type = 'afterpay_default';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            consentCheckbox: props => <ConsentCheckbox {...props} />
        };
    }
}
