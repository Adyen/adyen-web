import RedirectElement from '../Redirect';
import { TxVariants } from '../tx-variants';

class IdealElement extends RedirectElement {
    public static type = TxVariants.ideal;

    public static defaultProps = {
        type: IdealElement.type,
        name: 'iDEAL'
    };
}

export default IdealElement;
