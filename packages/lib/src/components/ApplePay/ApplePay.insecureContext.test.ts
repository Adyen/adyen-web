/**
 * @jest-environment-options {"url": "http://adyen.dev/"}
 *
 * jsdom v26 makes window.location unforgeable, so location.protocol can no longer be mocked at
 * runtime. This file sets an insecure (http) origin via the jsdom `url` environment option to
 * verify that Apple Pay refuses to start a session from an insecure document.
 */
import ApplePay from './ApplePay';
import ApplePaySdkLoader from './services/ApplePaySdkLoader';
import { mock } from 'jest-mock-extended';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { ICore } from '../../types';

jest.mock('../../core/Services/http');
jest.mock('./services/ApplePayService');
jest.mock('./services/ApplePaySdkLoader');

let mockApplePaySession;
let core: ICore;

beforeEach(() => {
    core = setupCoreMock();
    const mockApplePaySdkLoaderLoadFunction = jest.fn().mockImplementation(() => {
        mockApplePaySession = mock<ApplePaySession>({
            // @ts-ignore The following methods are not recognized as static members
            canMakePayments: jest.fn().mockReturnValue(true),
            applePayCapabilities: jest.fn().mockResolvedValue({}),
            supportsVersion: jest.fn().mockImplementation(() => true),
            STATUS_SUCCESS: 1,
            STATUS_FAILURE: 0
        });

        // @ts-ignore ApplePaySession does exist
        global.ApplePaySession = mockApplePaySession;

        Object.defineProperty(window, 'ApplePayWebOptions', {
            writable: true,
            value: {
                set: jest.fn()
            }
        });

        return Promise.resolve(mockApplePaySession);
    });

    // @ts-ignore 'ApplePaySdkLoader' is mocked
    ApplePaySdkLoader.mockImplementation(() => ({
        load: mockApplePaySdkLoaderLoadFunction,
        isSdkLoaded: jest.fn().mockResolvedValue(undefined)
    }));
});

afterEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    ApplePaySdkLoader.mockClear();

    jest.resetModules();
    jest.resetAllMocks();
});

describe('ApplePay in an insecure (http) context', () => {
    test('should reject if the page is not https', async () => {
        const applepay = new ApplePay(core);
        await expect(applepay.isAvailable()).rejects.toThrow('Trying to start an Apple Pay session from an insecure document');
    });
});
