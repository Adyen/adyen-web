import IssuerListContainer, { IssuerListContainerProps } from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

class PayByBank extends IssuerListContainer {
    public static type = TxVariants.paybybank;

    constructor(props: IssuerListContainerProps) {
        super({ ...props, showPaymentMethodItemImages: true });
    }
}

export default PayByBank;
