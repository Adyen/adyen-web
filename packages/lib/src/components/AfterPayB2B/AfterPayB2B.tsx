import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import ConsentCheckbox from './components/ConsentCheckbox';

export default class AfterPayB2B extends OpenInvoiceContainer {
    public static type = 'afterpay_b2b';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            visibility: {
                companyDetails: 'visible',
                ...props.visibility
            },
            consentCheckbox: props => <ConsentCheckbox {...props} />
        };
    }
}
