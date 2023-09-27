import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { Resources } from '../../core/Context/Resources';
import Language from '../../language';
import Trustly from './Trustly';

describe('TrustlyElement', () => {
    test('should render payment description by default', async () => {
        // @ts-ignore ignore
        render(<Trustly i18n={new Language()} loadingContext="test" modules={{ resources: new Resources() }} />);
        expect(await screen.findByText(/instant bank payment/i)).toBeTruthy();
        expect(await screen.findByText(/pay directly from any of your bank accounts/i)).toBeTruthy();
        expect(await screen.findByText(/no cards, no app download, no registration/i)).toBeTruthy();
    });

    test('should render redirect button if showPayButton is true', async () => {
        // @ts-ignore ignore
        render(<Trustly showPayButton={true} i18n={new Language()} loadingContext="test" modules={{ resources: new Resources() }} />);
        expect(await screen.findByRole('button')).toHaveTextContent('Continue to trustly');
    });

    test('should not render pay button if showPayButton is false', () => {
        // @ts-ignore ignore
        render(<Trustly showPayButton={false} i18n={new Language()} loadingContext="test" modules={{ resources: new Resources() }} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
