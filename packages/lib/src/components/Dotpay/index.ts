import IssuerListContainer from '../helpers/IssuerListContainer';

class DotpayElement extends IssuerListContainer {
    public static type = 'dotpay';
    public static txVariants = ['dotpay', 'onlineBanking'];
}

export default DotpayElement;
