import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import OnlineBankingPL from './OnlineBankingPL';
import { SRPanel } from '../../core/Errors/SRPanel';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

test('should return expected data to perform the payment', () => {
    const core = setupCoreMock();

    const onlineBankingPL = new OnlineBankingPL(core);
    expect(onlineBankingPL.formatData()).toEqual({ paymentMethod: { type: 'onlineBanking_PL' } });
});

test('should show regulations and information obligation links', async () => {
    const srPanel = mock<SRPanel>();
    srPanel.props.moveFocus = false;
    const resources = global.resources;

    const core = setupCoreMock();

    const onlineBankingPL = new OnlineBankingPL(core, {
        issuers: [{ name: 'Issuer 1', id: '1' }],
        i18n: global.i18n,
        modules: { srPanel, resources }
    });
    render(onlineBankingPL.render());

    const regulationLink = await screen.findByRole('link', { name: 'regulations' });
    expect(regulationLink).toBeTruthy();
    // @ts-ignore FIX TYPES
    expect(regulationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/regulamin');

    const obligationLink = await screen.findByRole('link', { name: 'information obligation' });
    expect(obligationLink).toBeTruthy();
    // @ts-ignore FIX TYPES
    expect(obligationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy');
});
test('should show regulations and information obligation links', async () => {
    const srPanel = mock<SRPanel>();
    srPanel.props.moveFocus = false;
    const resources = global.resources;

    const core = setupCoreMock();

    const onlineBankingPL = new OnlineBankingPL(core, {
        issuers: [{ name: 'Issuer 1', id: '1' }],
        i18n: global.i18n,
        modules: { srPanel, resources }
    });
    render(onlineBankingPL.render());

    const regulationLink = await screen.findByRole('link', { name: 'regulations' });
    expect(regulationLink).toBeTruthy();
    // @ts-ignore FIX TYPES
    expect(regulationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/regulamin');

    const obligationLink = await screen.findByRole('link', { name: 'information obligation' });
    expect(obligationLink).toBeTruthy();
    // @ts-ignore FIX TYPES
    expect(obligationLink).toHaveAttribute('href', 'https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy');
});
