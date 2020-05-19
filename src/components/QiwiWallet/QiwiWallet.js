import { h } from 'preact';
import UIElement from '../UIElement';
import PhoneInput from '../internal/PhoneInput';
import CoreProvider from '../../core/Context/CoreProvider';
import { formatPrefixName, selectItem } from './utils';
import withPayButton from '../helpers/withPayButton';
import getProp from '../../utils/getProp';

class QiwiWalletElement extends UIElement {
    static type = 'qiwiwallet';

    constructor(props) {
        super(props);
        this.props.items = this.props.items.map(formatPrefixName).filter(item => item !== false);
    }

    get isValid() {
        return !!this.state.isValid;
    }

    static defaultProps = {
        items: [],
        countryCode: null
    };

    formatProps(props) {
        const items = getProp(props, 'details.0.items') || props.items;

        return {
            onValid: () => {},
            ...props,
            prefixName: getProp(props, 'details.0.key') || 'qiwiwallet.telephoneNumberPrefix',
            phoneName: getProp(props, 'details.1.key') || 'qiwiwallet.telephoneNumber',
            selected: selectItem(items, props.countryCode),
            items
        };
    }

    /**
     * @private
     * Formats the component data output
     * @return {object} props
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
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <PhoneInput
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

export default withPayButton(QiwiWalletElement);
