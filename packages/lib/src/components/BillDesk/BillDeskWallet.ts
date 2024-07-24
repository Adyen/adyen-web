import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class BillDeskWalletElement extends IssuerListContainer {
    public static type = TxVariants.billdesk_wallet;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default BillDeskWalletElement;
