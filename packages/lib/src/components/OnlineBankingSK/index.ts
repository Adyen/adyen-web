import IssuerListContainer from '../helpers/IssuerListContainer';
import getImage from '../../utils/get-image';

const TERMS_AND_CONDITIONS = 'https://static.payu.com/sites/terms/files/payu_privacy_policy_sk.pdf';
const ICON = 'bankTransfer_IBAN';

class OnlineBankingSKElement extends IssuerListContainer {
    public static type = 'onlineBanking_SK';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false,
            termsAndConditionsUrl: TERMS_AND_CONDITIONS
        };
    }

    get icon(): string {
        return this.props.icon ?? getImage({ loadingContext: this.props.loadingContext })(ICON);
    }
}

export default OnlineBankingSKElement;
