import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class DotpayElement extends IssuerListContainer {
    public static readonly type = TxVariants.dotpay;
}

export default DotpayElement;
