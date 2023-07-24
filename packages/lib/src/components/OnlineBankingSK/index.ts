import IssuerListContainer from '../helpers/IssuerListContainer';

const TERMS_AND_CONDITIONS = 'https://static.payu.com/sites/terms/files/payu_privacy_policy_sk.pdf';
const ICON = 'bankTransfer_IBAN';

class OnlineBankingSKElement extends IssuerListContainer {
    public static type = 'onlineBanking_SK';

    private static termsAndConditions = {
        translationKey: 'onlineBanking.termsAndConditions',
        urls: [TERMS_AND_CONDITIONS]
    };

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false,
            termsAndConditions: OnlineBankingSKElement.termsAndConditions
        };
    }

    get icon(): string {
        return this.props.icon ?? this.resources.getImage({})(ICON);
    }
}

export default OnlineBankingSKElement;
