import IssuerListContainer from '../helpers/IssuerListContainer';

class OnlineBankingPL extends IssuerListContainer {
    public static type = 'onlineBanking_PL';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default OnlineBankingPL;
