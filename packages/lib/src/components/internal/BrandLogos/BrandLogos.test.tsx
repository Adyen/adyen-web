import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { BrandLogos } from './BrandLogos';

describe('BrandLogos', () => {
    test('should render a single logo without a separator', () => {
        render(<BrandLogos brandLogo="logo.svg" alt="UPI" classNamePrefix="test" />);
        expect(screen.getByRole('img', { name: 'UPI' })).toHaveAttribute('src', 'logo.svg');
        expect(screen.queryByRole('separator', { hidden: true })).not.toBeInTheDocument();
    });

    test('should render a separator between each logo, hidden from assistive technology', () => {
        render(<BrandLogos brandLogo={['a.svg', 'b.svg', 'c.svg']} alt="UPI" classNamePrefix="test" />);
        expect(screen.getAllByRole('img')).toHaveLength(3);
        expect(screen.getAllByRole('separator', { hidden: true })).toHaveLength(2);
        expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    test('should render nothing when there is no logo', () => {
        render(<BrandLogos classNamePrefix="test" />);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
});
