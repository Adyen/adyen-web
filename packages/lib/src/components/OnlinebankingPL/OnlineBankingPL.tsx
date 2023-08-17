import IssuerListContainer from '../helpers/IssuerListContainer';
import Core from '../../core';

class OnlineBankingPL extends IssuerListContainer {
    public static type = 'onlineBanking_PL';

    private static disclaimerUrlsMap = {
        regulation: 'https://www.przelewy24.pl/regulamin',
        obligation: 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy'
    };

    private static termsAndConditions = {
        translationKey: 'onlineBankingPL.termsAndConditions',
        urls: [OnlineBankingPL.disclaimerUrlsMap.regulation, OnlineBankingPL.disclaimerUrlsMap.obligation]
    };

    constructor(checkoutRef: Core, props?) {
        super(checkoutRef, { ...props, termsAndConditions: OnlineBankingPL.termsAndConditions });
    }
}

export default OnlineBankingPL;
