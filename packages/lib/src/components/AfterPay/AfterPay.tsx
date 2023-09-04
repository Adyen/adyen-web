import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import ConsentCheckboxLabel from './components/ConsentCheckboxLabel';
import { getConsentLinkUrl } from './utils';
import { ALLOWED_COUNTRIES } from './config';
import { TxVariants } from '../tx-variants';

export default class AfterPay extends OpenInvoiceContainer {
    public static type = TxVariants.afterpay_default;
    public static txVariants = [TxVariants.afterpay_default, TxVariants.afterpay];

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : ALLOWED_COUNTRIES,
            consentCheckboxLabel: <ConsentCheckboxLabel url={getConsentLinkUrl(props.countryCode, props.i18n?.locale)} />
        };
    }
}
