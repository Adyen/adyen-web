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
});
