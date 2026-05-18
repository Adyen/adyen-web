import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class MolPayEbankingVNElement extends IssuerListContainer {
    public static readonly type = TxVariants.molpay_ebanking_VN;
}

export default MolPayEbankingVNElement;
