import { render, screen } from '@testing-library/preact';
import PayByBankUS from './PayByBankUS';

describe('PayByBank US', () => {
    test('should render payment description by default', async () => {
        const pbb = new PayByBankUS(global.core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(pbb.render());
        expect(await screen.findByText(/Use Pay by Bank to pay/i)).toBeTruthy();
        expect(await screen.findByText(/By connecting your bank account/i)).toBeTruthy();
    });

    test('should render redirect button by default', async () => {
        const pbb = new PayByBankUS(global.core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(pbb.render());
        expect(await screen.findByRole('button')).toHaveTextContent('Continue to');
    });

    test('should not render pay button if showPayButton is false', () => {
        const pbb = new PayByBankUS(global.core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources },
            showPayButton: false
        });

        render(pbb.render());
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
