import { TxVariants } from '../tx-variants';
import RedirectElement from '../Redirect';

class Riverty extends RedirectElement {
    public static readonly type = TxVariants.riverty;

    public static override defaultProps = {
        type: TxVariants.riverty
    };

    public override formatData() {
        return {
            paymentMethod: {
                type: this.type,
                subtype: 'redirect'
            },
            browserInfo: this.browserInfo
        };
    }
}

export default Riverty;
