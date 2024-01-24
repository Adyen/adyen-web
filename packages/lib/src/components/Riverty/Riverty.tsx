import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { allowedCountries, deliveryAddressSpecification, personalDetailsRequiredFields, termsAndConditionsUrlMap } from './config';
import ConsentCheckboxLabel from '../internal/ConsentCheckboxLabel';
import { getConsentUrl } from '../../utils/getConsentUrl';

export default class Riverty extends OpenInvoiceContainer {
    public static type = 'riverty';

    protected static defaultProps = {
        personalDetailsRequiredFields,
        allowedCountries,
        deliveryAddressSpecification,
        ...OpenInvoiceContainer.defaultProps
    };

    formatProps(props) {
        return {
            ...super.formatProps(props),
            allowedCountries: props.countryCode ? [props.countryCode] : allowedCountries,
            consentCheckboxLabel: <ConsentCheckboxLabel url={getConsentUrl(props.countryCode, props.i18n?.locale, termsAndConditionsUrlMap)} />
        };
    }
}
