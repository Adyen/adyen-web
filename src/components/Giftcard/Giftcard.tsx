import { h } from 'preact';
import UIElement from '../UIElement';
import GiftcardInput from './components/GiftcardInput';
import GiftcardResult from './components/GiftcardResult';
import CoreProvider from '../../core/Context/CoreProvider';
import getImage from '../../utils/get-image';

export class GiftcardElement extends UIElement {
    public static type = 'genericgiftcard';

    formatProps(props) {
        return props;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.props.type,
                ...this.state.data
            }
        };
    }

    get isValid() {
        return !!this.state.isValid;
    }

    get icon() {
        return getImage({ loadingContext: this.props.loadingContext })(this.props.type);
    }

    get displayName() {
        return this.props.name;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.remainingBalance ? (
                    <GiftcardResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                    />
                ) : (
                    <GiftcardInput
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        onChange={this.setState}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default GiftcardElement;
