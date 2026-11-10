import { mock } from 'jest-mock-extended';
import GooglePay from './GooglePay';
import Script from '../../utils/Script';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('../../utils/Script');

describe('GooglePay with a missing SDK', () => {
    test('should reject availability with an AdyenCheckoutError when the script loads without exposing the SDK', async () => {
        Reflect.deleteProperty(window, 'google');
        jest.mocked(Script).mockImplementation(() => {
            const script = mock<Script>();
            script.load.mockResolvedValue(undefined);
            return script;
        });

        const googlepay = new GooglePay(setupCoreMock(), {
            configuration: { merchantId: 'merchant-id', gatewayMerchantId: 'gateway-id' }
        });

        await expect(googlepay.isAvailable()).rejects.toMatchObject({
            name: 'ERROR',
            message: 'GooglePay - SDK is not available'
        });
    });
});
