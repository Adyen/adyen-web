import requestPayPalOauthToken, { PayPalOauthTokenData } from './request-paypal-oauth-token';
import { httpPost } from '../../../core/Services/http';

jest.mock('../../../core/Services/http');

const httpPostMock = httpPost as jest.Mock;

describe('requestPayPalOauthToken', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should call httpPost with the correct options and return the token data', async () => {
        const tokenData: PayPalOauthTokenData = {
            requestId: 'request-id',
            clientId: 'client-id',
            clientToken: 'client-token',
            expiresAt: '2026-01-01T00:00:00Z',
            merchantId: 'merchant-id'
        };
        httpPostMock.mockResolvedValue(tokenData);

        const loadingContext = 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
        const result = await requestPayPalOauthToken(loadingContext, { clientKey: 'test_client_key', merchantId: 'test_merchant' });

        expect(httpPostMock).toHaveBeenCalledTimes(1);
        expect(httpPostMock).toHaveBeenCalledWith(
            { loadingContext, path: 'utility/v1/payPal/token?clientKey=test_client_key', errorLevel: 'fatal' },
            { merchantId: 'test_merchant' }
        );
        expect(result).toBe(tokenData);
    });

    test('should call httpPost without a merchantId when it is not provided', async () => {
        httpPostMock.mockResolvedValue({});

        await requestPayPalOauthToken('https://loading-context/', { clientKey: 'abc' });

        expect(httpPostMock).toHaveBeenCalledWith(
            { loadingContext: 'https://loading-context/', path: 'utility/v1/payPal/token?clientKey=abc', errorLevel: 'fatal' },
            { merchantId: undefined }
        );
    });

    test('should reject when httpPost rejects', async () => {
        const error = new Error('Network error');
        httpPostMock.mockRejectedValue(error);

        await expect(requestPayPalOauthToken('https://loading-context/', { clientKey: 'abc' })).rejects.toThrow('Network error');
    });
});
