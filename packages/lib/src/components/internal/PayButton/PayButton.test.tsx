import { createRef, h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PayButton, { PayButtonProps } from './PayButton';
import { PAY_BTN_DIVIDER } from './utils';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmountProvider, AmountProviderProps } from '../../../core/Context/AmountProvider';

const renderPayButton = ({
    payButtonProps = {},
    amountProviderProps = {}
}: {
    payButtonProps?: Partial<PayButtonProps>;
    amountProviderProps?: Partial<AmountProviderProps>;
} = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <AmountProvider amount={amountProviderProps.amount} secondaryAmount={amountProviderProps.secondaryAmount} providerRef={createRef()}>
                <PayButton {...payButtonProps} />
            </AmountProvider>
        </CoreProvider>
    );
};

describe('PayButton', () => {
    test('should render a pay button', () => {
        renderPayButton();
        expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
    });

    test('should render a pay button with an amount', () => {
        const amountProviderProps = { amount: { currency: 'USD', value: 1000 } };
        renderPayButton({ amountProviderProps });

        expect(screen.getByRole('button', { name: 'Pay $10.00' })).toBeInTheDocument();
    });

    test('should render a pay button with a secondary amount', () => {
        const amountProviderProps = { amount: { currency: 'EUR', value: 1000 }, secondaryAmount: { currency: 'HRK', value: 7534 } };
        renderPayButton({ amountProviderProps });

        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Pay €10.00/ HRK 75.34');
    });

    test('should not render a secondary amount if it is undefined', () => {
        const amountProviderProps = { amount: { currency: 'USD', value: 1000 }, secondaryAmount: undefined };
        renderPayButton({ amountProviderProps });

        const button = screen.getByRole('button', { name: 'Pay $10.00' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should not render a secondary amount if there is no primary amount', () => {
        const amountProviderProps = { secondaryAmount: { currency: 'HRK', value: 7534 } };
        renderPayButton({ amountProviderProps });

        const button = screen.getByRole('button', { name: 'Pay' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should not render a secondary amount if primary amount is not correct', () => {
        const amountProviderProps = {
            amount: {
                currency: '',
                value: 1000
            },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        };
        renderPayButton({ amountProviderProps });

        const button = screen.getByRole('button', { name: 'Pay' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should not render any amount if a specific label is provided', () => {
        const amountProviderProps = {
            amount: { currency: 'USD', value: 1000 },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        };

        const payButtonProps = {
            label: 'Redirect to'
        };

        renderPayButton({ payButtonProps, amountProviderProps });

        const button = screen.getByRole('button', { name: 'Redirect to' });
        expect(button).not.toHaveTextContent('$10.00');
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should render a pay button with a custom amount', () => {
        const amountProviderProps = {
            amount: { currency: 'USD', value: 1000 }
        };

        const payButtonProps = {
            customAmount: { currency: 'USD', value: 500 }
        };

        renderPayButton({ payButtonProps, amountProviderProps });

        expect(screen.getByRole('button', { name: 'Pay $5.00' })).toBeInTheDocument();
    });

    test('should prefer explicit label over custom amount', () => {
        const amountProviderProps = {
            amount: { currency: 'USD', value: 1000 }
        };

        const payButtonProps = {
            label: 'Redirect to',
            customAmount: { currency: 'USD', value: 500 }
        };

        renderPayButton({ payButtonProps, amountProviderProps });

        const button = screen.getByRole('button', { name: 'Redirect to' });
        expect(button).not.toHaveTextContent('$5.00');
    });

    test('should render a zero-auth pay button', () => {
        const amountProviderProps = {
            amount: { currency: 'USD', value: 0 }
        };
        renderPayButton({ amountProviderProps });

        expect(screen.getByRole('button', { name: 'Confirm preauthorization' })).toBeInTheDocument();
    });

    test('should not render a secondary amount for a zero-auth payment', () => {
        const amountProviderProps = {
            amount: { currency: 'USD', value: 0 },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        };
        renderPayButton({ amountProviderProps });

        const button = screen.getByRole('button', { name: 'Confirm preauthorization' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });
});
