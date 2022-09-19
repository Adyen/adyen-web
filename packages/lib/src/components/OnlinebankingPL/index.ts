import IssuerListContainer from '../helpers/IssuerListContainer';

class OnlineBankingPL extends IssuerListContainer {
    public static type = 'onlineBanking_PL';

    formatProps(props) {
        const type = 'onlineBanking_PL'
        return {
            ...super.formatProps(props),
            showImage: false,
            type,
            issuers: props.paymentMethods.find(paymentMethod => paymentMethod.type === type)?.issuers
        };
    }
}

export default OnlineBankingPL;
