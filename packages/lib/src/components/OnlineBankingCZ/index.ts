import IssuerListContainer from '../helpers/IssuerListContainer';

const TERMS_AND_CONDITIONS = 'https://static.payu.com/sites/terms/files/payu_privacy_policy_cs.pdf';

class OnlineBankingCZElement extends IssuerListContainer {
    public static type = 'onlinebanking_CK';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false,
            termsAndConditionsUrl: TERMS_AND_CONDITIONS
        };
    }
}

export default OnlineBankingCZElement;
