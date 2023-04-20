import IssuerListContainer from '../helpers/IssuerListContainer';

const TERMS_AND_CONDITIONS = 'https://static.payu.com/sites/terms/files/payu_privacy_policy_cs.pdf';
const ICON = 'bankTransfer_IBAN';

class OnlineBankingCZElement extends IssuerListContainer {
    public static type = 'onlineBanking_CZ';

    private static termsAndConditions = {
        translationKey: 'onlineBanking.termsAndConditions',
        urls: [TERMS_AND_CONDITIONS]
    };

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false,
            termsAndConditions: OnlineBankingCZElement.termsAndConditions
        };
    }

    get icon(): string {
        return this.props.icon ?? this.resources.getImage({ loadingContext: this.props.loadingContext })(ICON);
    }
}

export default OnlineBankingCZElement;
