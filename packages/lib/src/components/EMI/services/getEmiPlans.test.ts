import { httpPost } from '../../../core/Services/http';
import { getEmiPlans } from './getEmiPlans';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { EMI_MISSING_CLIENT_KEY_MESSAGE, EMI_PLANS_PATH } from '../constants';

jest.mock('../../../core/Services/http');

const httpPostMock = httpPost as jest.Mock;

describe('getEmiPlans', () => {
    beforeEach(() => {
        httpPostMock.mockReset();
        httpPostMock.mockResolvedValue({ issuers: [] });
    });

    test('should post the token to the plans endpoint, rejecting on every failure', async () => {
        await getEmiPlans({ emiToken: 'test-emi-token', clientKey: 'test_clientkey', loadingContext: 'https://test/', timeout: 10000 });

        expect(httpPostMock).toHaveBeenCalledWith(
            {
                loadingContext: 'https://test/',
                path: `${EMI_PLANS_PATH}?clientKey=test_clientkey`,
                timeout: 10000,
                errorLevel: 'fatal'
            },
            { emiToken: 'test-emi-token' }
        );
    });

    test('should still send the request without a token, so its absence reaches the backend', async () => {
        await getEmiPlans({ clientKey: 'test_clientkey', loadingContext: 'https://test/', timeout: 10000 });

        const [, body] = httpPostMock.mock.calls[0];
        expect(JSON.stringify(body)).toBe('{}');
    });

    test('should resolve the response as it arrives', async () => {
        await expect(getEmiPlans({ emiToken: 'token', clientKey: 'key', loadingContext: 'https://test/', timeout: 10000 })).resolves.toEqual({
            issuers: []
        });
    });

    test('should reject without requesting anything when there is no clientKey', async () => {
        const request = getEmiPlans({ emiToken: 'token', loadingContext: 'https://test/', timeout: 10000 });

        await expect(request).rejects.toBeInstanceOf(AdyenCheckoutError);
        await expect(request).rejects.toThrow(EMI_MISSING_CLIENT_KEY_MESSAGE);
        expect(httpPostMock).not.toHaveBeenCalled();
    });
});
