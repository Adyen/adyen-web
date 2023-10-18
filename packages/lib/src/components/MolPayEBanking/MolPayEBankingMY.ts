import IssuerListContainer from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class MolPayEBankingMYElement extends IssuerListContainer {
    public static type = TxVariants.molpay_ebanking_fpx_MY;
}

export default MolPayEBankingMYElement;
