import IssuerListContainer from '../helpers/IssuerListContainer';

class PayuNetCashcardElement extends IssuerListContainer {
    public static type = 'payu_IN_cashcard';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default PayuNetCashcardElement;
