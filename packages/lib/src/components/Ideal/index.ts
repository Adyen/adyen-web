import IssuerListContainer from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class IdealElement extends IssuerListContainer {
    public static type = TxVariants.ideal;
}

export default IdealElement;
