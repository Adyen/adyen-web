import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { QRBrandLogos } from './QRBrandLogos';

describe('QRBrandLogos', () => {
    test('should render a single logo with the original wrapper markup, without a row container or separator', () => {
        const { container } = render(<QRBrandLogos brandLogo="logo.svg" alt="UPI" />);
        expect(container.innerHTML).toBe(
            '<div class="adyen-checkout__qr-loader__brand-logo-wrapper"><img src="logo.svg" alt="UPI" class="adyen-checkout__qr-loader__brand-logo"></div>'
        );
    });

    test('should render a separator between each logo, hidden from assistive technology', () => {
        render(<QRBrandLogos brandLogo={['a.svg', 'b.svg', 'c.svg']} alt="UPI" />);
        expect(screen.getByRole('img', { name: 'UPI' })).toHaveAttribute('src', 'a.svg');
        expect(screen.getAllByRole('img')).toHaveLength(3);
        expect(screen.getAllByRole('separator', { hidden: true })).toHaveLength(2);
        expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    test('should render nothing when there is no logo', () => {
        render(<QRBrandLogos />);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
});
