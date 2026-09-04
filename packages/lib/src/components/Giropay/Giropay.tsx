import { h } from 'preact';
import RedirectElement from '../Redirect';
import RedirectButton from '../internal/RedirectButton';
import { TxVariants } from '../tx-variants';

class GiropayElement extends RedirectElement {
    public static override readonly type: TxVariants = TxVariants.giropay;

    public override get displayName() {
        return this.props.name || this.constructor['type'];
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <RedirectButton
                {...this.props}
                showPayButton={this.props?.showPayButton || false}
                name={this.displayName}
                onSubmit={this.submit}
                payButton={this.payButton}
                setComponentRef={this.setComponentRef}
            />
        );
    }
}

export default GiropayElement;
