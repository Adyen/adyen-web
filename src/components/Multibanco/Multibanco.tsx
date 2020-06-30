import { h } from 'preact';
import UIElement from '../UIElement';
import MultibancoVoucherResult from './components/MultibancoVoucherResult';
import CoreProvider from '~/core/Context/CoreProvider';

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
                    {this.payButton({
                        ...this.props,
                        classNameModifiers: ['standalone'],
                        label: `${this.props.i18n.get('continueTo')} ${this.props.name}`,
                        onClick: this.submit
                    })}
                </CoreProvider>
            );
        }

        return null;
    }
}

export default MultibancoElement;
