import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PayButton, { PayButtonProps } from './PayButton';
import { PAY_BTN_DIVIDER } from './utils';
import { CoreProvider } from '../../../core/Context/CoreProvider';

const renderPayButton = (props: Partial<PayButtonProps>) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <PayButton {...props} />
        </CoreProvider>
    );
};

describe('PayButton', () => {
    test('should render a pay button', () => {
        renderPayButton({});
        expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
    });

    test('should render a pay button with an amount', () => {
        renderPayButton({ amount: { currency: 'USD', value: 1000 } });
        expect(screen.getByRole('button', { name: 'Pay $10.00' })).toBeInTheDocument();
    });

    test('should render a pay button with a secondary amount', () => {
        renderPayButton({
            amount: { currency: 'EUR', value: 1000 },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        });

        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Pay €10.00/ HRK 75.34');
    });

    test('should not render a secondary amount if it is undefined', () => {
        renderPayButton({ amount: { currency: 'USD', value: 1000 }, secondaryAmount: undefined });
        const button = screen.getByRole('button', { name: 'Pay $10.00' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should not render a secondary amount if there is no primary amount', () => {
        renderPayButton({ secondaryAmount: { currency: 'HRK', value: 7534 } });
        const button = screen.getByRole('button', { name: 'Pay' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should not render a secondary amount if primary amount is not correct', () => {
        renderPayButton({
            amount: {
                currency: '',
                value: 1000
            },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        });
        const button = screen.getByRole('button', { name: 'Pay' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should not render any amount if a specific label is provided', () => {
        renderPayButton({
            label: 'Redirect to',
            amount: { currency: 'USD', value: 1000 },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        });

        const button = screen.getByRole('button', { name: 'Redirect to' });
        expect(button).not.toHaveTextContent('$10.00');
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });

    test('should render a zero-auth pay button', () => {
        renderPayButton({ amount: { currency: 'USD', value: 0 } });
        expect(screen.getByRole('button', { name: 'Confirm preauthorization' })).toBeInTheDocument();
    });

    test('should not render a secondary amount for a zero-auth payment', () => {
        renderPayButton({ amount: { currency: 'USD', value: 0 }, secondaryAmount: { currency: 'HRK', value: 7534 } });
        const button = screen.getByRole('button', { name: 'Confirm preauthorization' });
        expect(button).not.toHaveTextContent(PAY_BTN_DIVIDER);
    });
});
