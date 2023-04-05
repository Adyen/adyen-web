import IssuerListContainer from '../helpers/IssuerListContainer';
import { h } from 'preact';
import { interpolateElement } from '../../language/utils';

class OnlineBankingPL extends IssuerListContainer {
    public static type = 'onlineBanking_PL';

    private static disclaimerLinksMap = {
        regulation: 'https://www.przelewy24.pl/regulamin',
        obligation: 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy'
    };

    constructor(props) {
        super({ ...props, termsAndConditions: () => this.renderTermsAndConditions() });
    }

    private renderTermsAndConditions() {
        return interpolateElement(this.props.i18n.get('onlineBankingPL.termsAndConditions'), [
            translation => (
                <a href={OnlineBankingPL.disclaimerLinksMap.regulation} target="_blank" rel="noopener noreferrer">
                    {translation}
                </a>
            ),
            translation => (
                <a href={OnlineBankingPL.disclaimerLinksMap.obligation} target="_blank" rel="noopener noreferrer">
                    {translation}
                </a>
            )
        ]);
    }
}

export default OnlineBankingPL;
