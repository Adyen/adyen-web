import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { TxVariants } from '../tx-variants';
import { ALLOWED_COUNTRIES } from './config';
import type { OpenInvoiceConfiguration } from '../helpers/OpenInvoiceContainer/types';

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
        }
    };

    formatProps(props: OpenInvoiceConfiguration) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES
        };
    }
}
