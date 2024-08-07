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
import type { OpenInvoiceConfiguration } from '../helpers/OpenInvoiceContainer/types';
import { TxVariants } from '../tx-variants';

export default class Riverty extends OpenInvoiceContainer {
    public static readonly type = TxVariants.riverty;

    protected static defaultProps = {
        personalDetailsRequiredFields,
        deliveryAddressSpecification,
        ...OpenInvoiceContainer.defaultProps
    };

    formatProps(props: OpenInvoiceConfiguration) {
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
