import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';

const TERMS_AND_CONDITIONS = 'https://static.payu.com/sites/terms/files/payu_privacy_policy_cs.pdf';
const ICON = 'bankTransfer_IBAN';

class OnlineBankingCZElement extends IssuerListContainer {
    public static readonly type = TxVariants.onlineBanking_CZ;

    private static readonly termsAndConditions = {
        translationKey: 'onlineBanking.termsAndConditions',
        urls: [TERMS_AND_CONDITIONS]
    };

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: true,
            termsAndConditions: OnlineBankingCZElement.termsAndConditions
        };
    }

    get icon(): string {
        return this.props.icon ?? this.resources.getImage()(ICON);
    }
}

export default OnlineBankingCZElement;
