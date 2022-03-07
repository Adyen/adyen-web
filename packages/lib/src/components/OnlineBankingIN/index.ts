import IssuerListContainer from '../helpers/IssuerListContainer';

class OnlineBankingINElement extends IssuerListContainer {
    public static type = 'onlinebanking_IN';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default OnlineBankingINElement;
