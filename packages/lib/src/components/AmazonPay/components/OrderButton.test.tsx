import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import OrderButton from './OrderButton';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../core/Context/AmountProvider';
import { updateAmazonCheckoutSession } from '../services';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

jest.mock('../services', () => ({
    updateAmazonCheckoutSession: jest.fn()
}));

const core = setupCoreMock();

const defaultProps = {
    amazonCheckoutSessionId: 'test-session-id',
    clientKey: 'test_client_key',
    chargePermissionType: 'OneTime' as const,
    onError: jest.fn(),
    recurringMetadata: {
        frequency: { unit: 'Month', value: 'Month' as const },
        amount: { amount: '10.00', currencyCode: 'EUR' as const }
    },
    publicKeyId: 'test-public-key',
    region: 'EU' as const,
    returnUrl: 'https://example.com/return'
};

const renderOrderButton = (props = {}) => {
    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <AmountProvider amount={{ currency: 'EUR', value: 1000 }} providerRef={createRef()}>
                {/* @ts-ignore ref is handled internally by preact */}
                <OrderButton {...defaultProps} {...props} />
            </AmountProvider>
        </CoreProvider>
    );
};

describe('OrderButton', () => {
    const oldWindowLocation = window.location;

    beforeAll(() => {
        delete window.location;
        // @ts-ignore test only
        window.location = Object.defineProperties(
            {},
            {
                ...Object.getOwnPropertyDescriptors(oldWindowLocation),
                assign: {
                    configurable: true,
                    value: jest.fn()
                }
            }
        );
    });

    afterAll(() => {
        window.location = oldWindowLocation as string & Location;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render a confirm purchase button', () => {
        renderOrderButton();
        expect(screen.getByRole('button', { name: 'Confirm purchase' })).toBeInTheDocument();
    });

    test('should call updateAmazonCheckoutSession when clicked', async () => {
        (updateAmazonCheckoutSession as jest.Mock).mockResolvedValue({
            action: { type: 'redirect', url: 'https://amazon.com/checkout' }
        });

        const user = userEvent.setup();
        renderOrderButton();

        await user.click(screen.getByRole('button', { name: 'Confirm purchase' }));

        expect(updateAmazonCheckoutSession).toHaveBeenCalledWith(
            'test',
            'test_client_key',
            expect.objectContaining({
                checkoutSessionId: 'test-session-id',
                checkoutResultReturnUrl: 'https://example.com/return',
                publicKeyId: 'test-public-key',
                region: 'EU'
            })
        );
    });

    test('should redirect when a redirect action is received', async () => {
        (updateAmazonCheckoutSession as jest.Mock).mockResolvedValue({
            action: { type: 'redirect', url: 'https://amazon.com/checkout' }
        });

        const user = userEvent.setup();
        renderOrderButton();

        await user.click(screen.getByRole('button', { name: 'Confirm purchase' }));

        await waitFor(() => {
            expect(window.location.assign).toHaveBeenCalledWith('https://amazon.com/checkout');
        });
    });

    test('should log error if response has no action type', async () => {
        (updateAmazonCheckoutSession as jest.Mock).mockResolvedValue({
            errorMessage: 'Something went wrong'
        });

        jest.spyOn(console, 'error').mockImplementation(() => {});

        const user = userEvent.setup();
        renderOrderButton();

        await user.click(screen.getByRole('button', { name: 'Confirm purchase' }));

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Something went wrong');
        });
    });
});
