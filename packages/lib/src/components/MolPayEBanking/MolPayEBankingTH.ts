import IssuerListContainer from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class MolPayEBankingTHElement extends IssuerListContainer {
    public static type = TxVariants.molpay_ebanking_TH;
}

export default MolPayEBankingTHElement;
