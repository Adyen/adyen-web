import { render, screen } from '@testing-library/preact';
import Trustly from './PayByBankUS';

describe('TrustlyElement', () => {
    test('should render payment description by default', async () => {
        const trustly = new Trustly(global.core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(trustly.render());
        expect(await screen.findByText(/instant bank payment/i)).toBeTruthy();
        expect(await screen.findByText(/pay directly from any of your bank accounts/i)).toBeTruthy();
        expect(await screen.findByText(/no cards, no app download, no registration/i)).toBeTruthy();
    });

    test('should render redirect button by default', async () => {
        const trustly = new Trustly(global.core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(trustly.render());
        expect(await screen.findByRole('button')).toHaveTextContent('Continue to trustly');
    });

    test('should not render pay button if showPayButton is false', () => {
        const trustly = new Trustly(global.core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources },
            showPayButton: false
        });

        render(trustly.render());
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
