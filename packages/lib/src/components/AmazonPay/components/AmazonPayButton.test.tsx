import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import AmazonPayButton from './AmazonPayButton';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../core/Context/AmountProvider';
import { AmazonPayButtonProps, AmazonWindowObject } from '../types';
import { getAmazonSignature } from '../services';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

jest.mock('../services', () => ({
    getAmazonSignature: jest.fn()
}));

const mockOnClickFn = jest.fn();
const mockRenderButton = jest.fn().mockReturnValue({ onClick: mockOnClickFn });
const mockInitCheckout = jest.fn();

const mockAmazonRef: AmazonWindowObject = {
    Pay: {
        renderButton: mockRenderButton,
        initCheckout: mockInitCheckout,
        signout: jest.fn(),
        bindChangeAction: jest.fn()
    }
};

const core = setupCoreMock();

const defaultProps: AmazonPayButtonProps = {
    amazonRef: mockAmazonRef,
    configuration: { region: 'EU', storeId: 'test-store', merchantId: 'test-merchant' },
    environment: 'TEST',
    locale: 'en_GB',
    clientKey: 'test_client_key',
    showPayButton: true,
    onClick: resolve => Promise.resolve(resolve()),
    onError: jest.fn(),
    placement: 'Cart',
    productType: 'PayAndShip',
    ref: createRef()
};

const customRender = (props: Partial<AmazonPayButtonProps> = {}) => {
    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources} analytics={core.modules.analytics}>
            <AmountProvider amount={{ currency: 'EUR', value: 1000 }} providerRef={createRef()}>
                <AmazonPayButton {...defaultProps} {...props} />
            </AmountProvider>
        </CoreProvider>
    );
};

describe('AmazonPayButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render the button container when showPayButton is true', () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        customRender();
        expect(screen.getByTestId('amazon-pay-button')).toBeInTheDocument();
    });

    test('should not render anything when showPayButton is false', () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        const { container } = customRender({ showPayButton: false });
        expect(container.innerHTML).toBe('');
    });

    test('should fetch the Amazon signature on mount', async () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        customRender();
        await waitFor(() => {
            expect(getAmazonSignature).toHaveBeenCalledWith('test', 'test_client_key', expect.any(Object));
        });
    });

    test('should call renderButton after receiving a valid signature', async () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        customRender();
        await waitFor(() => {
            expect(mockRenderButton).toHaveBeenCalledWith('#amazonPayButton', expect.any(Object));
        });
    });

    test('should register onClick handler on the rendered button', async () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        customRender();
        await waitFor(() => {
            expect(mockOnClickFn).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    test('should log error if signature response is empty', async () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        customRender();
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Could not get AmazonPay signature');
        });
    });

    test('should not call renderButton if signature is missing', async () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        customRender();
        await waitFor(() => {
            expect(getAmazonSignature).toHaveBeenCalled();
        });
        expect(mockRenderButton).not.toHaveBeenCalled();
    });

    test('should call onError when signature request fails', async () => {
        const onError = jest.fn();
        const error = new Error('Network failure');
        (getAmazonSignature as jest.Mock).mockRejectedValue(error);
        jest.spyOn(console, 'error').mockImplementation(() => {});
        customRender({ onError });
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(error);
        });
        expect(onError).toHaveBeenCalled();
    });

    test('should log the error to console when signature request fails', async () => {
        const error = new Error('Request failed');
        (getAmazonSignature as jest.Mock).mockRejectedValue(error);
        jest.spyOn(console, 'error').mockImplementation(() => {});
        customRender();
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(error);
        });
    });

    test('should not call renderButton when showPayButton is false even with valid signature', async () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        customRender({ showPayButton: false });
        await waitFor(() => {
            expect(getAmazonSignature).toHaveBeenCalled();
        });
        expect(mockRenderButton).not.toHaveBeenCalled();
    });

    test('should call initCheckout via the button onClick handler', async () => {
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        customRender();

        await waitFor(() => {
            expect(mockOnClickFn).toHaveBeenCalled();
        });

        // Get the onClick handler that was registered and invoke it
        const registeredHandler = mockOnClickFn.mock.calls[0][0];
        await registeredHandler();

        expect(mockInitCheckout).toHaveBeenCalledWith(
            expect.objectContaining({
                createCheckoutSessionConfig: expect.objectContaining({
                    signature: 'test-signature',
                    publicKeyId: undefined
                })
            })
        );
    });

    test('should call onError when onClick handler rejects', async () => {
        const onError = jest.fn();
        (getAmazonSignature as jest.Mock).mockResolvedValue({ signature: 'test-signature' });
        customRender({
            onError,
            onClick: (_resolve: (value?: unknown) => void, reject: () => void) => {
                reject();
                return Promise.resolve();
            }
        });

        await waitFor(() => {
            expect(mockOnClickFn).toHaveBeenCalled();
        });

        const registeredHandler = mockOnClickFn.mock.calls[0][0];
        await registeredHandler();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(onError).toHaveBeenCalled();
    });
});
