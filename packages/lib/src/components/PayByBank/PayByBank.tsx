import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import type { ICore } from '../../core/types';

class PayByBank extends IssuerListContainer {
    public static type = TxVariants.paybybank;

    constructor(checkout: ICore, props: IssuerListConfiguration) {
        super(checkout, { ...props, showPaymentMethodItemImages: true });
    }
}

export default PayByBank;
