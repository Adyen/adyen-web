import { h } from 'preact';
import UIElement from '../../UIElement';
import OpenInvoice from '../../internal/OpenInvoice';
import CoreProvider from '../../../core/Context/CoreProvider';
import { OpenInvoiceProps } from '../../internal/OpenInvoice/types';
import { AddressSpecifications } from '../../internal/Address/types';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import Redirect from '../../Redirect';

export interface OpenInvoiceContainerProps extends Partial<OpenInvoiceProps> {
    consentCheckboxLabel?: h.JSX.Element;
    billingAddressRequiredFields?: string[];
    billingAddressSpecification?: AddressSpecifications;
}

export default class OpenInvoiceContainer extends UIElement<OpenInvoiceContainerProps> {
    public static dependencies = [Redirect];

    protected static defaultProps: OpenInvoiceContainerProps = {
        onChange: () => {},
        data: { companyDetails: {}, personalDetails: {}, billingAddress: {}, deliveryAddress: {}, bankAccount: {} },
        visibility: {
            companyDetails: 'hidden',
            personalDetails: 'editable',
            billingAddress: 'editable',
            deliveryAddress: 'editable',
            bankAccount: 'hidden'
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
        const { companyDetails = {}, personalDetails = {}, billingAddress, deliveryAddress, bankAccount } = data;

        return {
            paymentMethod: {
                type: this.constructor['type']
            },
            ...personalDetails,
            ...companyDetails,
            ...(bankAccount && {
                bankAccount: {
                    iban: bankAccount.ibanNumber,
                    ownerName: bankAccount.ownerName,
                    countryCode: bankAccount.countryCode
                }
            }),
            ...(billingAddress && { billingAddress }),
            ...((deliveryAddress || billingAddress) && { deliveryAddress: deliveryAddress || billingAddress })
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    <OpenInvoice
                        setComponentRef={this.setComponentRef}
                        {...this.props}
                        {...this.state}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                </SRPanelProvider>
            </CoreProvider>
        );
    }
}
