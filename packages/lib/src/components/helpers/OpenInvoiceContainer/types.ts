import { OpenInvoiceProps } from '../../internal/OpenInvoice/types';
import { h } from 'preact';
import { AddressSpecifications } from '../../internal/Address/types';

export interface OpenInvoiceConfiguration extends Partial<OpenInvoiceProps> {
    consentCheckboxLabel?: h.JSX.Element;
    billingAddressRequiredFields?: string[];
    billingAddressSpecification?: AddressSpecifications;
}
