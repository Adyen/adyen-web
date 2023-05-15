import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import ConsentCheckboxLabel from './components/ConsentCheckboxLabel';
import { AFTERPAY_B2B_CONSENT_URL, ALLOWED_COUNTRIES } from './config';
import { OpenInvoiceContainerProps } from '../helpers/OpenInvoiceContainer/OpenInvoiceContainer';

export default class AfterPayB2B extends OpenInvoiceContainer {
    public static type = 'afterpay_b2b';

    protected static defaultProps: OpenInvoiceContainerProps = {
        onChange: () => {},
        data: { companyDetails: {}, personalDetails: {}, billingAddress: {}, deliveryAddress: {} },
        visibility: {
            companyDetails: 'editable',
            personalDetails: 'editable',
            billingAddress: 'editable',
            deliveryAddress: 'editable'
        }
    };

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES,
            consentCheckboxLabel: <ConsentCheckboxLabel url={AFTERPAY_B2B_CONSENT_URL} />
        };
    }
}
