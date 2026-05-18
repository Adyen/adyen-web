import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class PayuNetCashcardElement extends IssuerListContainer {
    public static readonly type = TxVariants.payu_IN_cashcard;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default PayuNetCashcardElement;
