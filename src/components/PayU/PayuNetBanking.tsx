import IssuerListContainer from '../helpers/IssuerListContainer';

class PayuNetBankingElement extends IssuerListContainer {
    public static type = 'payu_IN_nb';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default PayuNetBankingElement;
