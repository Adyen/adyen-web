import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import OnlineBankingPL from './OnlineBankingPL';
import { SRPanel } from '../../core/Errors/SRPanel';

test('should return expected data to perform the payment', () => {
    const onlineBankingPL = new OnlineBankingPL({ core: global.core });
    expect(onlineBankingPL.formatData()).toEqual({ paymentMethod: { type: 'onlineBanking_PL' } });
});

test('should show regulations and information obligation links', async () => {
    const srPanel = mock<SRPanel>();
    srPanel.props.moveFocus = false;
    const resources = global.resources;

    const onlineBankingPL = new OnlineBankingPL({
        core: global.core,
        issuers: [{ name: 'Issuer 1', id: '1' }],
        i18n: global.i18n,
        modules: { srPanel, resources }
    });
    render(onlineBankingPL.render());

    const regulationLink = await screen.findByRole('link', { name: 'regulations' });
    expect(regulationLink).toBeTruthy();
    expect(regulationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/regulamin');

    const obligationLink = await screen.findByRole('link', { name: 'information obligation' });
    expect(obligationLink).toBeTruthy();
    expect(obligationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy');
});
test('should show regulations and information obligation links', async () => {
    const srPanel = mock<SRPanel>();
    srPanel.props.moveFocus = false;
    const resources = global.resources;

    const onlineBankingPL = new OnlineBankingPL({
        core: global.core,
        issuers: [{ name: 'Issuer 1', id: '1' }],
        i18n: global.i18n,
        modules: { srPanel, resources }
    });
    render(onlineBankingPL.render());

    const regulationLink = await screen.findByRole('link', { name: 'regulations' });
    expect(regulationLink).toBeTruthy();
    expect(regulationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/regulamin');

    const obligationLink = await screen.findByRole('link', { name: 'information obligation' });
    expect(obligationLink).toBeTruthy();
    expect(obligationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy');
});
