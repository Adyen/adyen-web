import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { PayPalMessaging } from './PayPalMessaging';
import { AmountProvider, AmountProviderRef } from '../../../core/Context/AmountProvider';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalFetchContentOptions, PayPalSdkInstance } from '../paypal-js-types';
import type { PaymentAmount } from '../../../types';

const core = setupCoreMock();

const setup = ({
    amount = { value: 1000, currency: 'USD' },
    countryCode,
    messagingContentOptions
}: {
    amount?: PaymentAmount;
    countryCode?: string;
    messagingContentOptions?: Pick<PayPalFetchContentOptions, 'logoType' | 'logoPosition' | 'textColor'>;
} = {}) => {
    const fetchContent = jest.fn().mockResolvedValue(undefined);
    const createPayPalMessages = jest.fn().mockReturnValue({ fetchContent });

    const paypalService = mock<PayPalService>();
    paypalService.getInstance.mockReturnValue({ createPayPalMessages } as unknown as PayPalSdkInstance);

    const view = render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <AmountProvider amount={amount} providerRef={createRef<AmountProviderRef>()}>
                <PayPalMessaging paypalService={paypalService} countryCode={countryCode} messagingContentOptions={messagingContentOptions} />
            </AmountProvider>
        </CoreProvider>
    );

    return { ...view, paypalService, createPayPalMessages, fetchContent };
};

describe('PayPalMessaging', () => {
    test('should render the paypal-message web component', () => {
        setup();

        expect(screen.getByTestId('paypal-message')).toBeInTheDocument();
    });

    test('should create the messages instance with the buyer country and the currency of the transaction', async () => {
        const { createPayPalMessages } = setup({ amount: { value: 1000, currency: 'EUR' }, countryCode: 'NL' });

        await waitFor(() => expect(createPayPalMessages).toHaveBeenCalledWith({ buyerCountry: 'NL', currencyCode: 'EUR' }));
    });

    test('should fetch the content with the default presentation options', async () => {
        const { fetchContent } = setup();

        await waitFor(() => expect(fetchContent).toHaveBeenCalledTimes(1));
        expect(fetchContent).toHaveBeenCalledWith(
            expect.objectContaining({
                textColor: 'BLACK',
                logoPosition: 'LEFT',
                logoType: 'TEXT'
            })
        );
    });

    test('should fetch the content with the presentation options provided by the merchant', async () => {
        const { fetchContent } = setup({
            messagingContentOptions: { textColor: 'WHITE', logoPosition: 'TOP', logoType: 'WORDMARK' }
        });

        await waitFor(() => expect(fetchContent).toHaveBeenCalledTimes(1));
        expect(fetchContent).toHaveBeenCalledWith(
            expect.objectContaining({
                textColor: 'WHITE',
                logoPosition: 'TOP',
                logoType: 'WORDMARK'
            })
        );
    });

    test('should pass the amount as a decimal string without a currency sign', async () => {
        const { fetchContent } = setup({ amount: { value: 123450, currency: 'USD' } });

        await waitFor(() => expect(fetchContent).toHaveBeenCalledTimes(1));
        expect(fetchContent).toHaveBeenCalledWith(expect.objectContaining({ amount: '1234.5' }));
    });

    test('should push the fetched content into the paypal-message element once it is ready', async () => {
        const { fetchContent } = setup();

        await waitFor(() => expect(fetchContent).toHaveBeenCalledTimes(1));

        const setContent = jest.fn();
        Object.assign(screen.getByTestId('paypal-message'), { setContent });

        fetchContent.mock.calls[0][0].onReady('message-content');

        expect(setContent).toHaveBeenCalledWith('message-content');
    });

    test('should refetch the content when the amount changes', async () => {
        const providerRef = createRef<AmountProviderRef>();
        const fetchContent = jest.fn().mockResolvedValue(undefined);
        const paypalService = mock<PayPalService>();
        paypalService.getInstance.mockReturnValue({
            createPayPalMessages: jest.fn().mockReturnValue({ fetchContent })
        } as unknown as PayPalSdkInstance);

        render(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <AmountProvider amount={{ value: 1000, currency: 'USD' }} providerRef={providerRef}>
                    <PayPalMessaging paypalService={paypalService} countryCode="US" />
                </AmountProvider>
            </CoreProvider>
        );

        await waitFor(() => expect(fetchContent).toHaveBeenCalledTimes(1));

        providerRef.current?.update({ value: 5000, currency: 'USD' });

        await waitFor(() => expect(fetchContent).toHaveBeenCalledTimes(2));
        expect(fetchContent.mock.calls[1][0]).toEqual(expect.objectContaining({ amount: '50' }));
    });

    test('should not create a new messages instance on re-render when nothing changed', async () => {
        const { paypalService, createPayPalMessages, rerender } = setup();

        await waitFor(() => expect(createPayPalMessages).toHaveBeenCalledTimes(1));

        rerender(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <AmountProvider amount={{ value: 1000, currency: 'USD' }} providerRef={createRef<AmountProviderRef>()}>
                    <PayPalMessaging paypalService={paypalService} />
                </AmountProvider>
            </CoreProvider>
        );

        expect(createPayPalMessages).toHaveBeenCalledTimes(1);
    });
});
