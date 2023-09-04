import RedirectElement from '../Redirect';
import { TxVariants } from '../tx-variants';

class VippsElement extends RedirectElement {
    public static type = TxVariants.vipps;

    public static defaultProps = {
        type: VippsElement.type,
        showPayButton: true,
        name: 'Vipps'
    };
}

export default VippsElement;
