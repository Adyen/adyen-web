import IssuerListContainer from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class EntercashElement extends IssuerListContainer {
    public static type = TxVariants.entercash;
}

export default EntercashElement;
