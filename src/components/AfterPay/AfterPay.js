import { h } from 'preact';
import withOpenInvoice from '../helpers/withOpenInvoice';
import ConsentCheckbox from './components/ConsentCheckbox';

const AfterPay = withOpenInvoice({
    type: 'afterpay_default',
    // eslint-disable-next-line react/display-name
    consentCheckbox: props => <ConsentCheckbox {...props} />
});

export default AfterPay;
