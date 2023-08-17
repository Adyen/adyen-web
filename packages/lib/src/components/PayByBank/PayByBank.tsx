import IssuerListContainer from '../helpers/IssuerListContainer';
import Core from '../../core';

class PayByBank extends IssuerListContainer {
    public static type = 'paybybank';

    constructor(checkoutRef: Core, props) {
        super(checkoutRef, { ...props, showPaymentMethodItemImages: true });
    }
}

export default PayByBank;
