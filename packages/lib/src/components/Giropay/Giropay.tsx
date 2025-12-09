import { h } from 'preact';
import RedirectElement from '../Redirect';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';

class GiropayElement extends RedirectElement {
    public static type = TxVariants.giropay;

    get displayName() {
        return this.props.name || this.constructor['type'];
    }

    protected override componentToRender(): h.JSX.Element {
        if (this.props.showPayButton) {
            return (
                <RedirectButton
                    {...this.props}
                    showPayButton={this.props.showPayButton}
                    name={this.displayName}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                />
            );
        }

        return null;
    }
}

export default GiropayElement;
