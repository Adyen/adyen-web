import { h } from 'preact';
import UIElement from '../../UIElement';
import OpenInvoice from '../../internal/OpenInvoice';
import CoreProvider from '../../../core/Context/CoreProvider';

export default class OpenInvoiceContainer extends UIElement {
    protected static defaultProps = {
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
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <OpenInvoice
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    {...this.state}
                    consentCheckbox={this.props.consentCheckbox}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}
