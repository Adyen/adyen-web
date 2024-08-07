import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import Address from '../internal/Address';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';

export class AddressElement extends UIElement {
    public static type = TxVariants.address;

    get data() {
        return this.state.data;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <Address
                    setComponentRef={this.setComponentRef}
                    {...this.props}
                    onChange={this.setState}
                    {...(process.env.NODE_ENV !== 'production' && { payButton: this.payButton })}
                />
            </CoreProvider>
        );
    }
}

export default AddressElement;
