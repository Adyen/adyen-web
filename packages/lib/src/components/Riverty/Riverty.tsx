import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import {
    allowedBillingCountries,
    allowedDeliveryCountries,
    deliveryAddressSpecification,
    personalDetailsRequiredFields,
    termsAndConditionsUrlMap
} from './config';
import ConsentCheckboxLabel from '../internal/ConsentCheckboxLabel';
import { getConsentUrl } from '../../utils/getConsentUrl';
import { OpenInvoiceContainerProps } from '../helpers/OpenInvoiceContainer/OpenInvoiceContainer';

export default class Riverty extends OpenInvoiceContainer {
    public static readonly type = 'riverty';

    protected static defaultProps = {
        personalDetailsRequiredFields,
        deliveryAddressSpecification,
        ...OpenInvoiceContainer.defaultProps
    };

    formatProps(props: OpenInvoiceContainerProps) {
        return {
            ...super.formatProps(props),
            billingAddressSpecification: {
                ...props.billingAddressSpecification,
                allowedCountries: props.countryCode ? [props.countryCode] : allowedBillingCountries
            },
            deliveryAddressSpecification: { ...props.deliveryAddressSpecification, allowedCountries: allowedDeliveryCountries },
            consentCheckboxLabel: <ConsentCheckboxLabel url={getConsentUrl(props.countryCode, props.i18n?.locale, termsAndConditionsUrlMap)} />
        };
    }
}
