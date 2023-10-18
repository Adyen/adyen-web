import IssuerListContainer, { IssuerListContainerProps } from '../helpers/IssuerListContainer';
import { TxVariants } from '../tx-variants';

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

    constructor(props: IssuerListContainerProps) {
        super({ ...props, termsAndConditions: OnlineBankingPL.termsAndConditions });
    }
}

export default OnlineBankingPL;
