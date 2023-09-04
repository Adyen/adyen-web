import { h } from 'preact';
import UIElement from '../UIElement';
import PhoneInput from '../internal/PhoneInput';
import CoreProvider from '../../core/Context/CoreProvider';
import { formatPrefixName, selectItem } from './utils';
import COUNTRIES from './countries';
import { TxVariants } from '../tx-variants';

class QiwiWalletElement extends UIElement {
    public static type = TxVariants.qiwiwallet;

    public static defaultProps = {
        items: COUNTRIES.map(formatPrefixName).filter(item => item !== false),
        countryCode: COUNTRIES[0].code,
        prefixName: 'qiwiwallet.telephoneNumberPrefix' || COUNTRIES[0].id,
        phoneName: 'qiwiwallet.telephoneNumber' || ''
    };

    get isValid() {
        return !!this.state.isValid;
    }

    formatProps(props) {
        return {
            onValid: () => {},
            ...props,
            selected: selectItem(props.items, props.countryCode)
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: QiwiWalletElement.type,
                'qiwiwallet.telephoneNumberPrefix': this.state.data ? this.state.data.phonePrefix : '',
                'qiwiwallet.telephoneNumber': this.state.data ? this.state.data.phoneNumber : ''
            }
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <PhoneInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    {...this.state}
                    phoneLabel={'mobileNumber'}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default QiwiWalletElement;
