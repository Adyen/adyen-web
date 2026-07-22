import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PayPalComponentV6 } from './PaypalComponentV6';
import type { PayPalComponentV6Props } from './types';
import type { PayPalService } from '../services/PayPalService';

jest.mock('./PayPalButton', () => ({ PayPalButton: () => <div data-testid="paypal-button" /> }));
jest.mock('./PayPalPayLaterButton', () => ({ PayPalPayLaterButton: () => <div data-testid="paypal-pay-later-button" /> }));
jest.mock('./PayPalCreditButton', () => ({ PayPalCreditButton: () => <div data-testid="paypal-credit-button" /> }));
jest.mock('./VenmoButton', () => ({ VenmoButton: () => <div data-testid="venmo-button" /> }));

const createProps = (overrides: Partial<PayPalComponentV6Props> = {}): PayPalComponentV6Props => ({
    paypalService: mock<PayPalService>(),
    style: { paypal: { type: 'paypal', class: 'paypal-gold' }, venmo: { type: 'venmo', class: 'venmo-blue' } },
    commit: true,
    vault: false,
    onSubmit: jest.fn(),
    onApprove: jest.fn(),
    onShippingAddressChange: jest.fn(),
    onShippingOptionsChange: jest.fn(),
    onCancel: jest.fn(),
    onError: jest.fn(),
    ...overrides
});

describe('PayPalComponentV6', () => {
    test('should render the container and all buttons by default', () => {
        render(<PayPalComponentV6 {...createProps()} />);

        expect(screen.getByTestId('paypal-component')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-pay-later-button')).toBeInTheDocument();
        expect(screen.getByTestId('paypal-credit-button')).toBeInTheDocument();
        expect(screen.getByTestId('venmo-button')).toBeInTheDocument();
    });

    test('should not render the pay later button when blocked', () => {
        render(<PayPalComponentV6 {...createProps({ blockPayPalPayLaterButton: true })} />);

        expect(screen.queryByTestId('paypal-pay-later-button')).not.toBeInTheDocument();
        expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
    });

    test('should not render the credit button when blocked', () => {
        render(<PayPalComponentV6 {...createProps({ blockPayPalCreditButton: true })} />);

        expect(screen.queryByTestId('paypal-credit-button')).not.toBeInTheDocument();
    });

    test('should not render the venmo button when blocked', () => {
        render(<PayPalComponentV6 {...createProps({ blockPayPalVenmoButton: true })} />);

        expect(screen.queryByTestId('venmo-button')).not.toBeInTheDocument();
    });

    test('should always render the main PayPal button even when the other buttons are blocked', () => {
        render(
            <PayPalComponentV6 {...createProps({ blockPayPalPayLaterButton: true, blockPayPalCreditButton: true, blockPayPalVenmoButton: true })} />
        );

        expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
        expect(screen.queryByTestId('paypal-pay-later-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('paypal-credit-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('venmo-button')).not.toBeInTheDocument();
    });
});
