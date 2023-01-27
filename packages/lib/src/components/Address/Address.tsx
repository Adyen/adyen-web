import { h } from 'preact';
import UIElement from '../UIElement';
import Address from '../internal/Address';
import CoreProvider from '../../core/Context/CoreProvider';

export class AddressElement extends UIElement {
    get data() {
        return this.state.data;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    public setComponentRef = ref => {
        this.componentRef = ref;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
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
