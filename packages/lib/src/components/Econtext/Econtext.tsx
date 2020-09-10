import { h } from 'preact';
import UIElement from '../UIElement';
import EcontextInput from './components/EcontextInput';
import EcontextVoucherResult from './components/EcontextVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';
import getImage from '../../utils/get-image';

export class EcontextElement extends UIElement {
    public static type = 'econtext';

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.props.type || EcontextElement.type,
                ...this.state.data
            }
        };
    }

    get icon() {
        return getImage({ loadingContext: this.props.loadingContext })(this.props.type);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.reference ? (
                    <EcontextVoucherResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                    />
                ) : (
                    <EcontextInput
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default EcontextElement;
