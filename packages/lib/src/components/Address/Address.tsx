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

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <Address
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                />
            </CoreProvider>
        );
    }
}

export default AddressElement;
