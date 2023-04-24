import IssuerListContainer from '../helpers/IssuerListContainer';

class PayByBank extends IssuerListContainer {
    public static type = 'paybybank';
    constructor(props) {
        super({ ...props, showPaymentMethodItemImages: true });
    }
}

export default PayByBank;
