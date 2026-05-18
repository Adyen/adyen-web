import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { BrandIcons } from './BrandIcons';

import type { BrandIcon } from './types';

const brandIcons: BrandIcon[] = [
    { src: 'https://example.com/visa.svg', alt: 'visa' },
    { src: 'https://example.com/mc.svg', alt: 'mc' },
    { src: 'https://example.com/amex.svg', alt: 'amex' },
    { src: 'https://example.com/discover.svg', alt: 'discover' }
];

describe('BrandIcons', () => {
    test('should render all brand icons when no maxBrandsToShow is set', () => {
        render(<BrandIcons brandIcons={brandIcons} />);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(4);
        expect(images[0]).toHaveAttribute('alt', 'visa');
        expect(images[1]).toHaveAttribute('alt', 'mc');
        expect(images[2]).toHaveAttribute('alt', 'amex');
        expect(images[3]).toHaveAttribute('alt', 'discover');
    });

    test('should limit visible brands when maxBrandsToShow is set', () => {
        render(<BrandIcons brandIcons={brandIcons} maxBrandsToShow={2} />);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('alt', 'visa');
        expect(images[1]).toHaveAttribute('alt', 'mc');
    });

    test('should show default remaining brands count label', () => {
        render(<BrandIcons brandIcons={brandIcons} maxBrandsToShow={2} />);

        expect(screen.getByText('+ 2')).toBeInTheDocument();
    });

    test('should show custom remaining brands label', () => {
        render(<BrandIcons brandIcons={brandIcons} maxBrandsToShow={1} remainingBrandsLabel="& more" />);

        expect(screen.getByText('& more')).toBeInTheDocument();
    });

    test('should not show remaining label when all brands are visible', () => {
        render(<BrandIcons brandIcons={brandIcons} />);

        expect(screen.queryByText(/^\+ \d+$/)).not.toBeInTheDocument();
    });

    test('should not show remaining label when maxBrandsToShow equals brand count', () => {
        render(<BrandIcons brandIcons={brandIcons} maxBrandsToShow={4} />);

        expect(screen.queryByText(/^\+ \d+$/)).toBeNull();
    });

    test('should use renderBrandIcon when provided', () => {
        render(
            <BrandIcons
                brandIcons={brandIcons.slice(0, 2)}
                renderBrandIcon={brandIcon => <span data-testid={`custom-${brandIcon.alt}`}>{brandIcon.alt}</span>}
            />
        );

        expect(screen.getByTestId('custom-visa')).toBeInTheDocument();
        expect(screen.getByTestId('custom-mc')).toBeInTheDocument();
        expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    test('should render a single brand icon', () => {
        render(<BrandIcons brandIcons={[brandIcons[0]]} />);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute('alt', 'visa');
    });

    test('should render empty when brandIcons array is empty', () => {
        render(<BrandIcons brandIcons={[]} />);

        expect(screen.queryAllByRole('img')).toHaveLength(0);
        expect(screen.queryByText(/^\+ \d+$/)).toBeNull();
    });

    test('should pass showIconOnError to Brand components', () => {
        render(<BrandIcons brandIcons={[brandIcons[0]]} showIconOnError />);

        const wrappers = screen.getAllByTestId('brand-image-wrapper');
        expect(wrappers).toHaveLength(1);
    });
});
