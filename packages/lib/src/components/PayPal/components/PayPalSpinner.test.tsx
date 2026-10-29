import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { PayPalSpinner } from './PayPalSpinner';

describe('PayPalSpinner', () => {
    test('should render the loader with the pending status container', () => {
        render(<PayPalSpinner />);

        expect(screen.getByTestId('paypal-loader')).toBeInTheDocument();
    });

    test('should render the spinner inside the loader', () => {
        render(<PayPalSpinner />);

        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    test('should expose the loader as a busy live region for screen readers', () => {
        render(<PayPalSpinner />);

        const loader = screen.getByTestId('paypal-loader');

        expect(loader).toHaveAttribute('aria-live', 'polite');
        expect(loader).toHaveAttribute('aria-busy', 'true');
    });
});
