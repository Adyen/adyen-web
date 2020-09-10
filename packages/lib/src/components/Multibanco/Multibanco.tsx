import { h } from 'preact';
import UIElement from '../UIElement';
import MultibancoVoucherResult from './components/MultibancoVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';
import RedirectButton from '../internal/RedirectButton';

export class MultibancoElement extends UIElement {
    public static type = 'multibanco';
    public static defaultProps = { showPayButton: true };

    get isValid() {
        return true;
    }

    formatProps(props) {
        return {
            ...props,
            name: props.name || 'Multibanco'
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.props.type || MultibancoElement.type
            }
        };
    }

    private handleRef = ref => {
        this.componentRef = ref;
    };

    render() {
        if (this.props.reference) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <MultibancoVoucherResult ref={this.handleRef} {...this.props} />
                </CoreProvider>
            );
        }

        if (this.props.showPayButton) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <RedirectButton
                        name={this.displayName}
                        amount={this.props.amount}
                        payButton={this.payButton}
                        onSubmit={this.submit}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                </CoreProvider>
            );
        }

        return null;
    }
}

export default MultibancoElement;
