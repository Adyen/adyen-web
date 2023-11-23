import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { TxVariants } from '../tx-variants';
import { OpenInvoiceConfiguration } from '../helpers/OpenInvoiceContainer/types';
import { ALLOWED_COUNTRIES } from './config';

export default class AfterPayB2B extends OpenInvoiceContainer {
    public static type = TxVariants.afterpay_b2b;

    protected static defaultProps: Partial<OpenInvoiceConfiguration> = {
        onChange: () => {},
        data: { companyDetails: {}, personalDetails: {}, billingAddress: {}, deliveryAddress: {} },
        visibility: {
            companyDetails: 'editable',
            personalDetails: 'editable',
            billingAddress: 'editable',
            deliveryAddress: 'editable'
        },
        showFormInstruction: true
    };

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
