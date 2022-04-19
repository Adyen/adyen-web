import { h, Fragment } from 'preact';
import UIElement from '../UIElement';
// import PhoneInput from '../internal/PhoneInput';
import CoreProvider from '../../core/Context/CoreProvider';
import VpaInput from './components/VpaInput';
import Button from '../internal/Button';
import ContentSeparator from '../internal/ContentSeparator';
// import { formatP?refixName, selectItem } from './utils';
// import COUNTRIES from './countries';

class UPICollect extends UIElement {
    public static type = 'upi_collect';

    // public static defaultProps = {
    //     items: COUNTRIES.map(formatPrefixName).filter(item => item !== false),
    //     countryCode: COUNTRIES[0].code,
    //     prefixName: 'qiwiwallet.telephoneNumberPrefix' || COUNTRIES[0].id,
    //     phoneName: 'qiwiwallet.telephoneNumber' || ''
    // };

    get isValid() {
        return !!this.state.isValid;
    }

    // formatProps(props) {
    //     return {
    //         onValid: () => {},
    //         ...props,
    //         selected: selectItem(props.items, props.countryCode)
    //     };
    // }

    formatData() {
        return {
            paymentMethod: {
                type: UPICollect.type
                // vpa
            }
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <Fragment>
                    <VpaInput />
                    {this.props.showPayButton && this.payButton({ label: `${this.props.i18n.get('continue')}` })}
                    <ContentSeparator label="or" />
                    <Button variant="secondary" label="Generate QR code" />
                </Fragment>
            </CoreProvider>
        );
    }
}

export default UPICollect;
