import IssuerListContainer from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class PayuNetBankingElement extends IssuerListContainer {
    public static type = TxVariants.payu_IN_nb;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default PayuNetBankingElement;
