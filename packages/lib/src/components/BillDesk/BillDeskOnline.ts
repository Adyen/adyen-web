import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class BillDeskOnlineElement extends IssuerListContainer {
    public static type = TxVariants.billdesk_online;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default BillDeskOnlineElement;
