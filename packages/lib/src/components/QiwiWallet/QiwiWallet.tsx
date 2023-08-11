import { h } from 'preact';
import UIElement from '../UIElement';
import PhoneInput from '../internal/PhoneInput';
import CoreProvider from '../../core/Context/CoreProvider';
import { formatPrefixName, selectItem } from './utils';
import COUNTRIES from './countries';

class QiwiWalletElement extends UIElement {
    public static type = 'qiwiwallet';

    public static defaultProps = {
        items: COUNTRIES.map(formatPrefixName).filter(item => item !== false),
        countryCode: COUNTRIES[0].code,
        prefixName: 'qiwiwallet.telephoneNumberPrefix' || COUNTRIES[0].id,
        phoneName: 'qiwiwallet.telephoneNumber' || ''
    };

    constructor(props) {
        super(props);
        this.componentRef = {};
    }

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
        const { i18n, loadingContext, showPayButton, items, selected } = this.props;

        return (
            <CoreProvider i18n={i18n} loadingContext={loadingContext} resources={this.resources}>
                <PhoneInput
                    ref={ref => {
                        if (!this.componentRef.showValidation && ref.triggerValidation) {
                            this.componentRef = { ...this.componentRef, showValidation: ref.triggerValidation };
                        }
                    }}
                    phoneNumberKey={'mobileNumber'}
                    phoneNumberErrorKey={'error.va.gen.01'}
                    items={items}
                    data={{ phonePrefix: selected }}
                    onChange={this.setState}
                />

                {showPayButton && this.payButton({})}
            </CoreProvider>
        );
    }
}

export default QiwiWalletElement;
