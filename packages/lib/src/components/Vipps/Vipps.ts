import RedirectElement from '../Redirect';
import { TxVariants } from '../tx-variants';

class VippsElement extends RedirectElement {
    public static override readonly type: TxVariants = TxVariants.vipps;

    public static readonly defaultProps = {
        type: VippsElement.type,
        name: 'Vipps'
    };
}

export default VippsElement;
