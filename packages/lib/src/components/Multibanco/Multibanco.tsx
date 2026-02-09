import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import MultibancoVoucherResult from './components/MultibancoVoucherResult';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';
import { VoucherConfiguration } from '../internal/Voucher/types';

export class MultibancoElement extends UIElement<VoucherConfiguration> {
    public static type = TxVariants.multibanco;

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

    protected override componentToRender(): h.JSX.Element {
        if (this.props.reference) {
            return <MultibancoVoucherResult ref={this.handleRef} {...this.props} onActionHandled={this.onActionHandled} />;
        }

        if (this.props.showPayButton) {
            return (
                <RedirectButton
                    showPayButton={this.props.showPayButton}
                    name={this.displayName}
                    payButton={this.payButton}
                    onSubmit={this.submit}
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                />
            );
        }

        return null;
    }
}

export default MultibancoElement;
