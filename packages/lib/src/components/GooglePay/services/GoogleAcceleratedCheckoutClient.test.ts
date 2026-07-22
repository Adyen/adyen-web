import { mock } from 'jest-mock-extended';

import GoogleAcceleratedCheckoutClient, { AcceleratedCheckoutOptions, PaymentSheetResize } from './GoogleAcceleratedCheckoutClient';
import Script from '../../../utils/Script';
import { PaymentDataRequest } from '../models/PaymentDataRequest';

type MockAcceleratedClient = {
    isAvailable: jest.Mock;
    load: jest.Mock;
};

let capturedOptions: AcceleratedCheckoutOptions;
let mockClientInstance: MockAcceleratedClient;

const setGoogleGlobal = () => {
    mockClientInstance = {
        isAvailable: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
        load: jest.fn().mockResolvedValue({ status: 'SUCCESS' })
    };

    (globalThis as any).google = {
        payments: {
            api: {
                AcceleratedCheckoutClient: jest.fn().mockImplementation((options: AcceleratedCheckoutOptions) => {
                    capturedOptions = options;
                    return mockClientInstance;
                })
            }
        }
    };
};

const createOptions = (overrides?: Partial<AcceleratedCheckoutOptions>): AcceleratedCheckoutOptions => ({
    environment: 'TEST',
    paymentDataCallbacks: { onPaymentAuthorized: jest.fn() },
    acceleratedCheckoutConfig: { type: 'INLINE', containerId: 'container-id' },
    checkoutRequest: {} as PaymentDataRequest,
    ...overrides
});

/** Fires a resize event the same way the Google client would */
const emitResize = (resize: PaymentSheetResize) => capturedOptions.checkoutUiCallbacks.onPaymentSheetResized(resize);

/** Constructs the client and waits for the async Google client creation to settle */
const createClient = async (overrides?: Partial<AcceleratedCheckoutOptions>) => {
    const script = mock<Script>();
    script.load.mockResolvedValue();
    const client = new GoogleAcceleratedCheckoutClient(createOptions(overrides), script);
    await client.isAvailable();
    return { client, script };
};

beforeEach(() => {
    capturedOptions = undefined;
    setGoogleGlobal();
});

afterEach(() => {
    delete (globalThis as any).google;
    jest.clearAllMocks();
});

describe('GoogleAcceleratedCheckoutClient', () => {
    describe('client creation', () => {
        test('should load the script when the Google global is not available', async () => {
            delete (globalThis as any).google;

            const script = mock<Script>();
            script.load.mockImplementation(() => {
                setGoogleGlobal();
                return Promise.resolve();
            });

            const client = new GoogleAcceleratedCheckoutClient(createOptions(), script);
            await client.isAvailable();

            expect(script.load).toHaveBeenCalledTimes(1);
        });

        test('should not load the script when the Google global is already available', async () => {
            const { script } = await createClient();

            expect(script.load).not.toHaveBeenCalled();
        });

        test('should inject its own "onPaymentSheetResized" handler into the Google client options', async () => {
            await createClient();

            expect(capturedOptions.checkoutUiCallbacks.onPaymentSheetResized).toEqual(expect.any(Function));
        });
    });

    describe('isAvailable()', () => {
        test('should delegate to the underlying Google client', async () => {
            const { client } = await createClient();
            mockClientInstance.isAvailable.mockResolvedValue({ status: 'SUCCESS' });

            await expect(client.isAvailable()).resolves.toEqual({ status: 'SUCCESS' });
        });

        test('should forward the error status from the underlying Google client', async () => {
            const { client } = await createClient();
            mockClientInstance.isAvailable.mockResolvedValue({ status: 'ERROR', errorMessage: 'not eligible' });

            await expect(client.isAvailable()).resolves.toEqual({ status: 'ERROR', errorMessage: 'not eligible' });
        });
    });

    describe('load()', () => {
        test('should delegate to the underlying Google client', async () => {
            const { client } = await createClient();
            mockClientInstance.load.mockResolvedValue({ status: 'SUCCESS' });

            await expect(client.load()).resolves.toEqual({ status: 'SUCCESS' });
        });
    });

    describe('onPaymentSheetResize()', () => {
        test('should notify the subscriber when the payment sheet is resized', async () => {
            const { client } = await createClient();
            const subscriber = jest.fn();

            client.onPaymentSheetResize(subscriber);
            emitResize({ height: 400, heightCss: '400px' });

            expect(subscriber).toHaveBeenCalledTimes(1);
            expect(subscriber).toHaveBeenCalledWith({ height: 400, heightCss: '400px' });
        });

        test('should not invoke a fresh subscriber before any resize event has been emitted', async () => {
            const { client } = await createClient();
            const subscriber = jest.fn();

            client.onPaymentSheetResize(subscriber);

            expect(subscriber).not.toHaveBeenCalled();
        });

        test('should immediately replay the last emitted value to a late subscriber', async () => {
            const { client } = await createClient();

            emitResize({ height: 300, heightCss: '300px' });
            emitResize({ height: 620, heightCss: '620px' });

            const lateSubscriber = jest.fn();
            client.onPaymentSheetResize(lateSubscriber);

            expect(lateSubscriber).toHaveBeenCalledTimes(1);
            expect(lateSubscriber).toHaveBeenCalledWith({ height: 620, heightCss: '620px' });
        });

        test('should stop notifying the subscriber after unsubscribing', async () => {
            const { client } = await createClient();
            const subscriber = jest.fn();

            const unsubscribe = client.onPaymentSheetResize(subscriber);
            emitResize({ height: 400, heightCss: '400px' });

            unsubscribe();
            emitResize({ height: 500, heightCss: '500px' });

            expect(subscriber).toHaveBeenCalledTimes(1);
            expect(subscriber).toHaveBeenCalledWith({ height: 400, heightCss: '400px' });
        });

        test('should only notify the most recently registered subscriber', async () => {
            const { client } = await createClient();
            const firstSubscriber = jest.fn();
            const secondSubscriber = jest.fn();

            client.onPaymentSheetResize(firstSubscriber);
            client.onPaymentSheetResize(secondSubscriber);
            emitResize({ height: 400, heightCss: '400px' });

            expect(firstSubscriber).not.toHaveBeenCalled();
            expect(secondSubscriber).toHaveBeenCalledWith({ height: 400, heightCss: '400px' });
        });
    });
});
