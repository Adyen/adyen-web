import { h } from 'preact';
import OpenInvoiceContainer from '../helpers/OpenInvoiceContainer';
import {
    DISCLAIMER_MESSAGE_TRANSLATION_KEY,
    allowedBillingCountries,
    allowedDeliveryCountries,
    deliveryAddressSpecification,
    personalDetailsRequiredFields,
    termsAndConditionsUrlMap,
    privacyPolicyUrlMap
} from './config';
import { getConsentUrl } from '../../utils/getConsentUrl';
import { LabelOnlyDisclaimerMessage } from '../internal/DisclaimerMessage/DisclaimerMessage';
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
        const tocURL = getConsentUrl(props.countryCode, props.i18n?.locale, termsAndConditionsUrlMap);
        const privacyURL = getConsentUrl(props.countryCode, props.i18n?.locale, privacyPolicyUrlMap);

        return {
            ...super.formatProps(props),
            billingAddressSpecification: {
                ...props.billingAddressSpecification,
                allowedCountries: props.countryCode ? [props.countryCode] : allowedBillingCountries
            },
            deliveryAddressSpecification: {
                ...props.deliveryAddressSpecification,
                allowedCountries: allowedDeliveryCountries
            },
            consentCheckboxLabel: (
                <LabelOnlyDisclaimerMessage message={props.i18n.get(DISCLAIMER_MESSAGE_TRANSLATION_KEY)} urls={[tocURL, privacyURL]} />
            )
        };
    }
}
