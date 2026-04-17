import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import AmazonPayComponent from './AmazonPayComponent';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../core/Context/AmountProvider';
import { AmazonPayComponentProps, AmazonWindowObject } from '../types';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';
import { mock } from 'jest-mock-extended';

jest.mock('../../../utils/Script', () => {
    return jest.fn().mockImplementation(() => {
        return { load: jest.fn().mockResolvedValue(undefined), remove: jest.fn() };
    });
});

const mockAmazonRef: AmazonWindowObject = {
    Pay: {
        renderButton: jest.fn().mockReturnValue({ onClick: jest.fn() }),
        initCheckout: jest.fn(),
        signout: jest.fn(),
        bindChangeAction: jest.fn()
    }
};

const core = setupCoreMock();

const defaultProps: AmazonPayComponentProps = {
    ...mock<AmazonPayComponentProps>(),
    configuration: { region: 'EU', storeId: 'test-store' },
    environment: 'TEST',
    locale: 'en_GB',
    clientKey: 'test_client_key',
    showPayButton: true,
    showSignOutButton: false,
    showOrderButton: true,
    showChangePaymentDetailsButton: false,
    onClick: resolve => Promise.resolve(resolve()),
    onSignOut: resolve => Promise.resolve(resolve()),
    onError: jest.fn(),
    setComponentRef: jest.fn()
};

const customRender = (props: Partial<AmazonPayComponentProps> = {}) => {
    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources} analytics={core.modules.analytics}>
            <AmountProvider amount={{ currency: 'EUR', value: 1000 }} providerRef={createRef()}>
                <AmazonPayComponent {...defaultProps} {...props} />
            </AmountProvider>
        </CoreProvider>
    );
};

describe('AmazonPayComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // @ts-ignore mock window.amazon
        window.amazon = mockAmazonRef;
    });

    afterEach(() => {
        // @ts-ignore cleanup
        delete window.amazon;
    });

    test('should show a spinner while the Amazon Pay script is loading', () => {
        // @ts-ignore remove amazon from window to simulate loading
        delete window.amazon;
        customRender();
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    test('should render the AmazonPayButton when the script is loaded', async () => {
        customRender();
        await waitFor(() => {
            expect(screen.getByTestId('amazon-pay-button')).toBeInTheDocument();
        });
    });

    test('should render SignOutButton when showSignOutButton is true', async () => {
        customRender({ showSignOutButton: true });
        await waitFor(() => {
            expect(screen.getByText('Sign out from Amazon')).toBeInTheDocument();
        });
    });

    test('should render OrderButton when amazonCheckoutSessionId is provided', async () => {
        customRender({
            amazonCheckoutSessionId: 'test-session-id',
            showOrderButton: true,
            returnUrl: 'https://example.com'
        });
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Confirm purchase' })).toBeInTheDocument();
        });
    });

    test('should render ChangePaymentDetailsButton when showChangePaymentDetailsButton is true', async () => {
        customRender({
            amazonCheckoutSessionId: 'test-session-id',
            showChangePaymentDetailsButton: true
        });
        await waitFor(() => {
            expect(screen.getByTestId('amazon-pay-change-payment-details-button')).toBeInTheDocument();
        });
    });

    test('should call setComponentRef on mount', async () => {
        const setComponentRef = jest.fn();
        customRender({ setComponentRef });
        await waitFor(() => {
            expect(setComponentRef).toHaveBeenCalledWith(
                expect.objectContaining({
                    getSubmitFunction: expect.any(Function)
                })
            );
        });
    });

    test('getSubmitFunction should return a function when the AmazonPayButton is rendered', async () => {
        const setComponentRef = jest.fn();
        customRender({ setComponentRef });
        await waitFor(() => {
            expect(setComponentRef).toHaveBeenCalled();
        });
        const ref = setComponentRef.mock.calls[0][0];
        const submitFn = ref.getSubmitFunction();
        expect(typeof submitFn).toBe('function');
    });
});
