import { h } from 'preact';
import UIElement from '../UIElement';
import OpenInvoice from '../internal/OpenInvoice';
import CoreProvider from '../../core/Context/CoreProvider';
import { unformatDate } from '../internal/FormFields/InputDate/utils';

/**
 * OpenInvoiceContainer: A higher order function which returns a different class based on issuerType
 * @extends UIElement
 */
const withOpenInvoice = ({ type, consentCheckbox }) => {
    return class OpenInvoiceContainer extends UIElement {
        static type = type;

        static defaultProps = {
            onChange: () => {},
            data: { personalDetails: {}, billingAddress: {}, deliveryAddress: {} },
            visibility: {
                personalDetails: 'editable',
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        };

        /**
         * Returns whether the component state is valid or not
         * @return {boolean} isValid
         */
        get isValid() {
            return !!this.state.isValid;
        }

        /**
         * Formats props on construction time
         * @return {object} props
         */
        formatProps(props) {
            return {
                ...props,
                data: {
                    ...props.data,
                    billingAddress: {
                        ...props.data.billingAddress,
                        country: props.countryCode || props.data.billingAddress.countryCode
                    },
                    deliveryAddress: {
                        ...props.data.deliveryAddress,
                        country: props.countryCode || props.data.deliveryAddress.countryCode
                    }
                }
            };
        }

        /**
         * Formats the component data output
         * @return {object} props
         */
        formatData() {
            const { data = {} } = this.state;
            const { personalDetails = {}, billingAddress = {}, deliveryAddress, separateDeliveryAddress } = data;
            const { firstName, lastName, gender = 'UNKNOWN', telephoneNumber, shopperEmail, dateOfBirth } = personalDetails;

            return {
                paymentMethod: {
                    type: OpenInvoiceContainer.type
                },
                shopperName: { firstName, lastName, gender },
                dateOfBirth: unformatDate(dateOfBirth),
                telephoneNumber,
                shopperEmail,
                billingAddress,
                deliveryAddress: separateDeliveryAddress === 'true' ? deliveryAddress : billingAddress,
                countryCode: billingAddress.country
            };
        }

        render() {
            const { i18n } = this.props;

            return (
                <CoreProvider i18n={i18n} loadingContext={this.props.loadingContext}>
                    <OpenInvoice
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        {...this.state}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        consentCheckbox={consentCheckbox}
                        payButton={this.payButton}
                    />
                </CoreProvider>
            );
        }
    };
};

export default withOpenInvoice;
