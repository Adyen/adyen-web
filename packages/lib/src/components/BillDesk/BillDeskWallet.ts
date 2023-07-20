import IssuerListContainer from '../helpers/IssuerListContainer';

class BillDeskWalletElement extends IssuerListContainer {
    public static type = 'billdesk_wallet';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default BillDeskWalletElement;
