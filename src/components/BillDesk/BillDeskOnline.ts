import IssuerListContainer from '../helpers/IssuerListContainer';

class BillDeskOnlineElement extends IssuerListContainer {
    public static type = 'billdesk_online';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default BillDeskOnlineElement;
