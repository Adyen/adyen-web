import IssuerListContainer from '../helpers/IssuerListContainer';

const TERMS_AND_CONDITIONS = 'https://static.payu.com/sites/terms/files/payu_privacy_policy_sk.pdf';

class OnlineBankingSKElement extends IssuerListContainer {
    public static type = 'onlinebanking_SK';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false,
            termsAndConditionsUrl: TERMS_AND_CONDITIONS
        };
    }
}

export default OnlineBankingSKElement;
