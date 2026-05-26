import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import AvailableBrands from './AvailableBrands';
import { BrandConfiguration } from '../../../../types';

const BRANDS: BrandConfiguration[] = [
    { name: 'visa', icon: 'https://example.com/visa.svg' },
    { name: 'mc', icon: 'https://example.com/mc.svg' }
];

const renderAvailableBrands = (props: { brands: BrandConfiguration[]; activeBrand: string }) => render(<AvailableBrands {...props} />);

describe('AvailableBrands', () => {
    test('renders null when brands array is empty', () => {
        renderAvailableBrands({ brands: [], activeBrand: 'card' });
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('renders null when brands is undefined', () => {
        renderAvailableBrands({ brands: undefined as BrandConfiguration[], activeBrand: 'card' });
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('renders brand icons when brands are provided', () => {
        renderAvailableBrands({ brands: BRANDS, activeBrand: 'card' });
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
    });

    describe('Accessibility – hidden state', () => {
        test('applies the hidden class and aria-hidden when activeBrand is not "card"', () => {
            renderAvailableBrands({ brands: BRANDS, activeBrand: 'visa' });
            const list = screen.getByRole('list', { hidden: true });

            expect(list).toHaveAttribute('aria-hidden', 'true');
        });

        test('does not apply the hidden class when activeBrand is "card"', () => {
            renderAvailableBrands({ brands: BRANDS, activeBrand: 'card' });
            const list = screen.getByRole('list');

            expect(list).toHaveAttribute('aria-hidden', 'false');
            expect(screen.getAllByRole('img')).toHaveLength(2);
        });
    });
});
