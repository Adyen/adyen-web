import { createRef, h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import PayButton, { PayButtonProps } from './PayButton';
import { PAY_BTN_DIVIDER } from './utils';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import Language from '../../../language';
import { AmountProvider, AmountProviderProps } from '../../../core/Context/AmountProvider';
import { ButtonProps } from '../Button/types';

const renderPayButton = ({
    payButtonProps = {},
    amountProviderProps = {},
    i18n = global.i18n
}: {
    payButtonProps?: Partial<PayButtonProps>;
    amountProviderProps?: Partial<AmountProviderProps>;
    i18n?: Language;
} = {}) => {
    return render(
        <CoreProvider i18n={i18n} loadingContext="test" resources={global.resources}>
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

    test('should call onClick handler with event and callbacks matching ButtonProps signature', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn<ReturnType<ButtonProps['onClick']>, Parameters<ButtonProps['onClick']>>();

        const payButtonProps: Partial<PayButtonProps> = {
            onClick: handleClick
        };

        renderPayButton({ payButtonProps });

        const button = screen.getByRole('button', { name: 'Pay' });
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'click' }),
            expect.objectContaining({ complete: expect.any(Function) })
        );
    });

    test('should not call onClick handler when button is disabled', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn<ReturnType<ButtonProps['onClick']>, Parameters<ButtonProps['onClick']>>();

        const payButtonProps: Partial<PayButtonProps> = {
            onClick: handleClick,
            disabled: true
        };

        renderPayButton({ payButtonProps });

        const button = screen.getByRole('button', { name: 'Pay' });
        await user.click(button);

        expect(handleClick).not.toHaveBeenCalled();
    });
});

describe('PayButton - localized labels', () => {
    const deI18n = new Language({
        locale: 'de-DE',
        translations: {
            payButton: 'Kaufen',
            payAmountFormat: 'Kaufen für %@'
        }
    });

    const nlI18n = new Language({
        locale: 'nl-NL',
        translations: {
            payButton: 'Betaal',
            payAmountFormat: '%@ betalen'
        }
    });

    describe('de-DE', () => {
        test('should render formatted amount label using payAmountFormat', () => {
            renderPayButton({ amountProviderProps: { amount: { currency: 'EUR', value: 1000 } }, i18n: deI18n });

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Kaufen für');
            expect(button).toHaveTextContent('10,00');
        });

        test('should fall back to payButton label when amount is not provided', () => {
            renderPayButton({ amountProviderProps: { amount: undefined }, i18n: deI18n });

            expect(screen.getByRole('button', { name: 'Kaufen' })).toBeInTheDocument();
        });
        test('should render secondary amount after the label when format is label-first', () => {
            const amountProviderProps = { amount: { currency: 'EUR', value: 1000 }, secondaryAmount: { currency: 'USD', value: 1200 } };
            renderPayButton({ amountProviderProps, i18n: deI18n });

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent(/Kaufen für.*€/);
            expect(screen.getByText(/^\/ /)).toBeInTheDocument();
        });
    });

    describe('nl-NL', () => {
        test('should render formatted amount with reversed token position', () => {
            renderPayButton({ amountProviderProps: { amount: { currency: 'EUR', value: 1000 } }, i18n: nlI18n });

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent(/.*€.*betalen/);
        });

        test('should render secondary amount inline without a separate label when format is amount-first', () => {
            const amountProviderProps = { amount: { currency: 'EUR', value: 1000 }, secondaryAmount: { currency: 'USD', value: 1200 } };
            renderPayButton({ amountProviderProps, i18n: nlI18n });

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent(/€.*\/.*\$.*betalen/);
            expect(screen.queryByText(/^\/ /)).not.toBeInTheDocument();
        });

        test('should fall back to payButton label without amount formatting when amount is null', () => {
            renderPayButton({ amountProviderProps: { amount: undefined }, i18n: nlI18n });

            const button = screen.getByRole('button', { name: 'Betaal' });
            expect(button).toBeInTheDocument();
            expect(button).not.toHaveTextContent('betalen');
        });
    });
});
