import IssuerListContainer from '../helpers/IssuerListContainer';
import getImage from '../../utils/get-image';
import { interpolateElement } from '../../language/utils';
import { h } from 'preact';

const TERMS_AND_CONDITIONS = 'https://static.payu.com/sites/terms/files/payu_privacy_policy_sk.pdf';
const ICON = 'bankTransfer_IBAN';

class OnlineBankingSKElement extends IssuerListContainer {
    public static type = 'onlineBanking_SK';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false,
            termsAndConditions: () => this.termsAndConditions()
        };
    }

    get icon(): string {
        return this.props.icon ?? getImage({ loadingContext: this.props.loadingContext })(ICON);
    }

    private termsAndConditions() {
        return interpolateElement(this.props.i18n.get('onlineBanking.termsAndConditions'), [
            translation => (
                <a href={TERMS_AND_CONDITIONS} target="_blank" rel="noopener noreferrer">
                    {translation}
                </a>
            )
        ]);
    }
}

export default OnlineBankingSKElement;
