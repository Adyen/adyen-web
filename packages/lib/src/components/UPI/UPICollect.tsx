import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import UPIComponent from './components/UPIComponent';

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
                <UPIComponent
                    ref={(ref: RefObject<typeof UPIComponent>) => {
                        this.componentRef = ref;
                    }}
                    showPayButton={this.props.showPayButton}
                    payButton={this.payButton}
                    onChange={this.setState}
                    onSubmit={this.submit}
                />
                {/*<Fragment>*/}
                {/*    <VpaInput />*/}
                {/*    {this.props.showPayButton && this.payButton({ label: `${this.props.i18n.get('continue')}` })}*/}
                {/*    <ContentSeparator label="or" />*/}
                {/*    <Button variant="secondary" label="Generate QR code" />*/}
                {/*</Fragment>*/}
            </CoreProvider>
        );
    }
}

export default UPICollect;
