import { h } from 'preact';
import UIElement from '../UIElement';
import DokuInput from './components/DokuInput';
import DokuVoucherResult from './components/DokuVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';
import getImage from '../../utils/get-image';

export class DokuElement extends UIElement {
    public static type = 'doku';

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state.data,
            paymentMethod: {
                type: this.props.type || DokuElement.type
            }
        };
    }

    get icon() {
        return getImage({ loadingContext: this.props.loadingContext })(this.props.type);
    }

    public setComponentRef = ref => {
        this.componentRef = ref;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.reference ? (
                    <DokuVoucherResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                    />
                ) : (
                    <DokuInput
                        setComponentRef={this.setComponentRef}
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

export default DokuElement;
