import { createRef, h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Installments, { InstallmentOptions, InstallmentsProps } from './Installments';
import { CoreProvider } from '../../../../../../core/Context/CoreProvider';
import { AmountProvider, AmountProviderProps } from '../../../../../../core/Context/AmountProvider';
import { PaymentAmount } from '../../../../../../types';

const DEFAULT_AMOUNT: PaymentAmount = { value: 30000, currency: 'USD' };

const renderInstallments = ({
    installmentsProps = {},
    amountProviderProps = {}
}: {
    installmentsProps?: Partial<InstallmentsProps>;
    amountProviderProps?: Partial<AmountProviderProps>;
} = {}) => {
    const installmentOptions: InstallmentOptions = {
        card: { values: [1, 2] },
        mc: { values: [1, 2, 3] },
        visa: { values: [1, 2, 3, 4] },
        ...installmentsProps.installmentOptions
    };

    const defaultProps: InstallmentsProps = {
        brand: 'card',
        installmentOptions,
        onChange: jest.fn(),
        ...installmentsProps
    };

    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <AmountProvider amount={DEFAULT_AMOUNT} {...amountProviderProps} providerRef={createRef()}>
                <Installments {...defaultProps} />
            </AmountProvider>
        </CoreProvider>
    );
};

describe('Installments', () => {
    const user = userEvent.setup();

    test('should render the installments dropdown by default', () => {
        renderInstallments();
        expect(screen.getByText('Number of installments')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Number of installments/i })).toBeInTheDocument();
    });

    test('should not render if the passed amount is 0', () => {
        renderInstallments({ amountProviderProps: { amount: { value: 0, currency: 'EUR' } } });
        expect(screen.queryByText('Number of installments')).not.toBeInTheDocument();
    });

    test('should not render any installment options by default when no card key is passed', () => {
        renderInstallments({ installmentsProps: { installmentOptions: { mc: { values: [1, 2, 3] } } } });
        expect(screen.queryByText('Number of installments')).not.toBeInTheDocument();
    });

    test('should render as readonly if only one option is passed', () => {
        const installmentOptions: InstallmentOptions = {
            card: { values: [3] }
        };
        renderInstallments({ installmentsProps: { installmentOptions } });
        expect(screen.getByRole('button')).toBeDisabled();
    });

    test('should preselect the value from "preselectedValue"', async () => {
        const installmentOptions: InstallmentOptions = {
            card: { values: [1, 2], preselectedValue: 2 }
        };
        renderInstallments({ installmentsProps: { installmentOptions, type: 'amount' } });
        expect(await screen.findByRole('button')).toHaveTextContent('2x $150.00');
    });

    test('should preselect the first value if "preselectedValue" is not provided', async () => {
        renderInstallments({ installmentsProps: { type: 'amount' } });
        expect(await screen.findByRole('button')).toHaveTextContent('1x $300.00');
    });

    test('should render the correct number of installment options for each brand', async () => {
        const { rerender } = renderInstallments({ installmentsProps: { brand: 'card' } });
        await user.click(screen.getByRole('button'));
        expect(await screen.findAllByRole('option')).toHaveLength(2);

        rerender(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <AmountProvider amount={DEFAULT_AMOUNT} providerRef={createRef()}>
                    <Installments brand="mc" installmentOptions={{ mc: { values: [1, 2, 3] } }} />
                </AmountProvider>
            </CoreProvider>
        );
        await user.click(screen.getByRole('button'));
        expect(await screen.findAllByRole('option')).toHaveLength(3);

        rerender(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <AmountProvider amount={DEFAULT_AMOUNT} providerRef={createRef()}>
                    <Installments brand="visa" installmentOptions={{ visa: { values: [1, 2, 3, 4] } }} />
                </AmountProvider>
            </CoreProvider>
        );
        await user.click(screen.getByRole('button'));
        expect(await screen.findAllByRole('option')).toHaveLength(4);
    });

    describe('On brand change', () => {
        test('should keep the current value if the new brand supports it', async () => {
            const installmentOptions: InstallmentOptions = {
                card: { values: [1, 2, 3, 4], preselectedValue: 2 },
                visa: { values: [1, 2] }
            };

            const { rerender } = renderInstallments({ installmentsProps: { installmentOptions, brand: 'card', type: 'amount' } });
            expect(await screen.findByRole('button')).toHaveTextContent('2x $150.00');

            // Rerender with a new brand
            rerender(
                <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                    <AmountProvider amount={DEFAULT_AMOUNT} providerRef={createRef()}>
                        <Installments brand={'visa'} type={'amount'} installmentOptions={installmentOptions} />
                    </AmountProvider>
                </CoreProvider>
            );

            expect(await screen.findByRole('button')).toHaveTextContent('2x $150.00');
        });

        test('should use the new brands "preselectedValue" if the old value is not supported', async () => {
            const installmentOptions: InstallmentOptions = {
                card: { values: [1, 2, 3, 4], preselectedValue: 4 },
                visa: { values: [1, 2], preselectedValue: 2 }
            };
            const { rerender } = renderInstallments({ installmentsProps: { installmentOptions, brand: 'card', type: 'amount' } });

            expect(await screen.findByRole('button')).toHaveTextContent('4x $75.00');

            rerender(
                <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                    <AmountProvider amount={DEFAULT_AMOUNT} providerRef={createRef()}>
                        <Installments type={'amount'} brand="visa" installmentOptions={installmentOptions} />
                    </AmountProvider>
                </CoreProvider>
            );

            expect(await screen.findByRole('button')).toHaveTextContent('2x $150.00');
        });

        test('should default to the first option if the old value and "preselectedValue" are not supported', async () => {
            const installmentOptions: InstallmentOptions = {
                card: { values: [1, 2, 3, 4], preselectedValue: 4 },
                visa: { values: [1, 2] }
            };
            const { rerender } = renderInstallments({ installmentsProps: { installmentOptions, brand: 'card', type: 'amount' } });

            expect(await screen.findByRole('button')).toHaveTextContent('4x $75.00');

            rerender(
                <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                    <AmountProvider amount={DEFAULT_AMOUNT} providerRef={createRef()}>
                        <Installments brand="visa" installmentOptions={installmentOptions} type={'amount'} />
                    </AmountProvider>
                </CoreProvider>
            );

            expect(await screen.findByRole('button')).toHaveTextContent('1x $300.00');
        });
    });

    describe('Revolving plans UI', () => {
        const installmentOptions: InstallmentOptions = {
            visa: {
                values: [1, 2, 3, 4],
                plans: ['regular', 'revolving']
            },
            mc: {
                values: [1, 2, 3]
            }
        };

        test('should render radio buttons when plans are available for the brand', () => {
            renderInstallments({ installmentsProps: { brand: 'visa', installmentOptions } });

            expect(screen.getByRole('radio', { name: 'One time payment' })).toBeVisible();
            expect(screen.getByRole('radio', { name: 'Installments payment' })).toBeVisible();
            expect(screen.getByRole('radio', { name: 'Revolving payment' })).toBeVisible();
        });

        test('should show installments options when shopper selects "installments payment"', async () => {
            renderInstallments({ installmentsProps: { brand: 'visa', installmentOptions } });

            await user.click(screen.getByRole('radio', { name: 'Installments payment' }));
            expect(await screen.findAllByRole('option')).toHaveLength(4);
        });

        test('should not render radio buttons when no plans are available for the brand', () => {
            renderInstallments({ installmentsProps: { brand: 'mc', installmentOptions } });
            expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
        });
    });
});
