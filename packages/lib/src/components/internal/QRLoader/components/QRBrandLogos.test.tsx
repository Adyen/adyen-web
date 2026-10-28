import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { QRBrandLogos } from './QRBrandLogos';

describe('QRBrandLogos', () => {
    test('should render a single logo with the original wrapper markup, without a row container or separator', () => {
        const { container } = render(<QRBrandLogos brandLogos={[{ src: 'logo.svg', alt: 'UPI' }]} />);
        expect(container.innerHTML).toBe(
            '<div class="adyen-checkout__qr-loader__brand-logo-wrapper"><img src="logo.svg" alt="UPI" class="adyen-checkout__qr-loader__brand-logo"></div>'
        );
    });

    test('should announce every logo with its own alt text and render a hidden separator between them', () => {
        render(
            <QRBrandLogos
                brandLogos={[
                    { src: 'a.svg', alt: 'A' },
                    { src: 'b.svg', alt: 'B' },
                    { src: 'c.svg', alt: 'C' }
                ]}
            />
        );
        expect(screen.getAllByRole('img').map(img => img.getAttribute('alt'))).toEqual(['A', 'B', 'C']);
        expect(screen.getByRole('img', { name: 'B' })).toHaveAttribute('src', 'b.svg');
        expect(screen.getAllByRole('separator', { hidden: true })).toHaveLength(2);
        expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    test('should render nothing when there is no logo', () => {
        render(<QRBrandLogos brandLogos={[]} />);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
});
