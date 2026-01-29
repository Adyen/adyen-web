import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import { AmountProvider, AmountProviderRef, useAmount, useSecondaryAmount } from './AmountProvider';

const AmountConsumer = () => {
    const { amount, isZeroAuth } = useAmount();

    return (
        <div>
            <div data-testid="amount">{amount ? `${amount.currency}:${amount.value}` : 'undefined'}</div>
            <div data-testid="isZeroAuth">{String(isZeroAuth)}</div>
        </div>
    );
};

const SecondaryAmountConsumer = () => {
    const { secondaryAmount } = useSecondaryAmount();
    return <div data-testid="secondaryAmount">{secondaryAmount ? `${secondaryAmount.currency}:${secondaryAmount.value}` : 'undefined'}</div>;
};

describe('AmountProvider', () => {
    test('should throw error when useAmount is used outside AmountProvider', () => {
        expect(() => render(<AmountConsumer />)).toThrow('useAmount must be used within an AmountProvider');
    });

    test('should throw error when useSecondaryAmount is used outside AmountProvider', () => {
        expect(() => render(<SecondaryAmountConsumer />)).toThrow('useAmount must be used within an AmountProvider');
    });

    test('should provide amount and derived flags when using the custom hook', () => {
        const providerRef = createRef<AmountProviderRef>();

        render(
            <AmountProvider amount={{ currency: 'USD', value: 1000 }} providerRef={providerRef}>
                <AmountConsumer />
            </AmountProvider>
        );

        expect(screen.getByTestId('amount')).toHaveTextContent('USD:1000');
        expect(screen.getByTestId('isZeroAuth')).toHaveTextContent('false');
    });

    test('should set isZeroAuth to true when amount.value is 0', () => {
        const providerRef = createRef<AmountProviderRef>();

        render(
            <AmountProvider amount={{ currency: 'USD', value: 0 }} providerRef={providerRef}>
                <AmountConsumer />
            </AmountProvider>
        );

        expect(screen.getByTestId('isZeroAuth')).toHaveTextContent('true');
    });

    test('should expose secondary amount when using useSecondaryAmount hook', () => {
        const providerRef = createRef<AmountProviderRef>();

        render(
            <AmountProvider amount={{ currency: 'EUR', value: 1000 }} secondaryAmount={{ currency: 'HRK', value: 7534 }} providerRef={providerRef}>
                <SecondaryAmountConsumer />
            </AmountProvider>
        );

        expect(screen.getByTestId('secondaryAmount')).toHaveTextContent('HRK:7534');
    });

    test('should update the amount using providerRef.update function', async () => {
        const providerRef = createRef<AmountProviderRef>();

        render(
            <AmountProvider amount={{ currency: 'USD', value: 1000 }} secondaryAmount={{ currency: 'EUR', value: 500 }} providerRef={providerRef}>
                <AmountConsumer />
                <SecondaryAmountConsumer />
            </AmountProvider>
        );

        providerRef.current.update({ currency: 'GBP', value: 2500 }, { currency: 'USD', value: 3000 });

        await waitFor(() => {
            expect(screen.getByTestId('amount')).toHaveTextContent('GBP:2500');
            expect(screen.getByTestId('secondaryAmount')).toHaveTextContent('USD:3000');
        });
    });

    test('should update amount when amount prop changes', async () => {
        const providerRef = createRef<AmountProviderRef>();

        const { rerender } = render(
            <AmountProvider amount={{ currency: 'USD', value: 1000 }} providerRef={providerRef}>
                <AmountConsumer />
            </AmountProvider>
        );

        expect(screen.getByTestId('amount')).toHaveTextContent('USD:1000');

        rerender(
            <AmountProvider amount={{ currency: 'USD', value: 2000 }} providerRef={providerRef}>
                <AmountConsumer />
            </AmountProvider>
        );

        await waitFor(() => expect(screen.getByTestId('amount')).toHaveTextContent('USD:2000'));
    });

    test('should not override an existing AmountContext when nested', () => {
        const outerRef = createRef<AmountProviderRef>();
        const innerRef = createRef<AmountProviderRef>();

        render(
            <AmountProvider amount={{ currency: 'USD', value: 1000 }} providerRef={outerRef}>
                <AmountProvider amount={{ currency: 'EUR', value: 2000 }} providerRef={innerRef}>
                    <AmountConsumer />
                </AmountProvider>
            </AmountProvider>
        );

        expect(screen.getByTestId('amount')).toHaveTextContent('USD:1000');
    });
});
