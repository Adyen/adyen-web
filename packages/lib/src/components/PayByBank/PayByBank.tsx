import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';

class PayByBank extends IssuerListContainer {
    public static type = TxVariants.paybybank;

    constructor(props: IssuerListConfiguration) {
        super({ ...props, showPaymentMethodItemImages: true });
    }
}

export default PayByBank;
