import IssuerListContainer from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class BillDeskWalletElement extends IssuerListContainer {
    public static type = TxVariants.billdesk_wallet;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false,
            placeholder: 'issuerList.wallet.placeholder'
        };
    }
}

export default BillDeskWalletElement;
