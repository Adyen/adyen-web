import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import { allowedCountries, deliveryAddressSpecification, personalDetailsRequiredFields, termsAndConditionsUrlMap } from './config';
import ConsentCheckboxLabel from '../internal/ConsentCheckboxLabel';
import { getConsentUrl } from '../../utils/getConsentUrl';

export default class Riverty extends OpenInvoiceContainer {
    public static readonly type = 'riverty';

    protected static defaultProps = {
        personalDetailsRequiredFields,
        deliveryAddressSpecification,
        ...OpenInvoiceContainer.defaultProps
    };

    formatProps(props) {
        return {
            ...super.formatProps(props),
            billingAddressSpecification: { ...props.billingAddressSpecification, allowedCountries },
            deliveryAddressSpecification: { ...props.deliveryAddressSpecification, allowedCountries: [] }, // Allow all the countries
            consentCheckboxLabel: <ConsentCheckboxLabel url={getConsentUrl(props.countryCode, props.i18n?.locale, termsAndConditionsUrlMap)} />
        };
    }
}
