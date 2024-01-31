import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';
import { IssuerListConfiguration } from '../helpers/IssuerListContainer/types';
import type { ICore } from '../../core/types';

class OnlineBankingPL extends IssuerListContainer {
    public static type = TxVariants.onlineBanking_PL;

    private static disclaimerUrlsMap = {
        regulation: 'https://www.przelewy24.pl/regulamin',
        obligation: 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy'
    };

    private static termsAndConditions = {
        translationKey: 'onlineBankingPL.termsAndConditions',
        urls: [OnlineBankingPL.disclaimerUrlsMap.regulation, OnlineBankingPL.disclaimerUrlsMap.obligation]
    };

    constructor(checkout: ICore, props: IssuerListConfiguration) {
        super(checkout, { ...props, termsAndConditions: OnlineBankingPL.termsAndConditions });
    }
}

export default OnlineBankingPL;
