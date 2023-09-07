import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import Language from '../../language';
import OnlineBankingPL from './OnlineBankingPL';
import { SRPanel } from '../../core/Errors/SRPanel';

test('should return expected data to perform the payment', () => {
    const onlineBankingPL = new OnlineBankingPL({});
    expect(onlineBankingPL.formatData()).toEqual({ paymentMethod: { type: 'onlineBanking_PL' } });
});

// test('should show regulations and information obligation links', async () => {
//     const i18n = mock<Language>();
//     i18n.get.mockImplementation(() => 'By continuing you agree with the %#regulations%# and %#information obligation%# of Przelewy24');
//     i18n.loaded = Promise.resolve();
//     const srPanel = mock<SRPanel>();
//     srPanel.props.moveFocus = false;
//
//     const onlineBankingPL = new OnlineBankingPL({ issuers: [{ name: 'Issuer 1', id: '1' }], i18n, modules: { srPanel } });
//     render(onlineBankingPL.render());
//
//     const regulationLink = await screen.findByRole('link', { name: 'regulations' });
//     expect(regulationLink).toBeTruthy();
//     expect(regulationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/regulamin');
//
//     const obligationLink = await screen.findByRole('link', { name: 'information obligation' });
//     expect(obligationLink).toBeTruthy();
//     expect(obligationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy');
// });
