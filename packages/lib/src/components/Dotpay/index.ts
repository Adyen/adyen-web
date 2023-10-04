import IssuerListContainer from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class DotpayElement extends IssuerListContainer {
    public static type = TxVariants.dotpay;
}

export default DotpayElement;
