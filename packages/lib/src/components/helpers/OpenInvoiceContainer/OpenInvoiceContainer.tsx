import { h } from 'preact';
import UIElement from '../../UIElement';
import OpenInvoice from '../../internal/OpenInvoice';
import CoreProvider from '../../../core/Context/CoreProvider';
import { UIElementProps } from '../../types';
import { AddressSpecifications } from '../../internal/Address/types';

interface OpenInvoiceElementProps extends UIElementProps {
    consentCheckboxLabel?: h.JSX.Element;
    billingAddressRequiredFields?: string[];
    billingAddressSpecification?: AddressSpecifications;

    // TODO: add other props for OpenInvoiceElement
    [key: string]: any;
}

export default class OpenInvoiceContainer extends UIElement<OpenInvoiceElementProps> {
    protected static defaultProps = {
        onChange: () => {},
        data: { companyDetails: {}, personalDetails: {}, billingAddress: {}, deliveryAddress: {} },
        visibility: {
            companyDetails: 'hidden',
            personalDetails: 'editable',
            billingAddress: 'editable',
            deliveryAddress: 'editable'
        }
    };

    /**
     * Returns whether the component state is valid or not
     */
    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats props on construction time
     */
    formatProps(props) {
        const country = props.countryCode || props.data?.billingAddress?.countryCode;

        return {
            ...props,
            allowedCountries: [country],
            visibility: {
                ...OpenInvoiceContainer.defaultProps.visibility,
                ...props.visibility
            },
            data: {
                ...props.data,
                billingAddress: {
                    ...props.data.billingAddress,
                    country
                },
                deliveryAddress: {
                    ...props.data.deliveryAddress,
                    country
                }
            }
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const { data = {} } = this.state;
        const { companyDetails = {}, personalDetails = {}, billingAddress, deliveryAddress } = data;

        return {
            paymentMethod: {
                type: this.constructor['type']
            },
            ...personalDetails,
            ...companyDetails,
            ...(billingAddress && { billingAddress }),
            ...((deliveryAddress || billingAddress) && { deliveryAddress: deliveryAddress || billingAddress })
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <OpenInvoice
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    {...this.state}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}
