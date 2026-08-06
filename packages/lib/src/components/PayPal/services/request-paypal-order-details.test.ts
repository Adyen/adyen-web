import requestPayPalOrderDetails, { PayPalOrderDetailsData } from './request-paypal-order-details';
import { httpGet } from '../../../core/Services/http';

jest.mock('../../../core/Services/http');

const httpGetMock = httpGet as jest.Mock;

describe('requestPayPalOrderDetails', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should call httpGet with the correct options and return the order details', async () => {
        const orderDetails: PayPalOrderDetailsData = {
            requestId: 'request-id',
            shopperName: { firstName: 'John', lastName: 'Doe' },
            billingAddress: {
                street: 'Simon Carmiggeltstraat',
                houseNumberOrName: '6-50',
                city: 'Amsterdam',
                postalCode: '1011 DJ',
                stateOrProvince: 'NH',
                country: 'NL'
            },
            deliveryAddress: {
                street: 'Simon Carmiggeltstraat',
                houseNumberOrName: '6-50',
                city: 'Amsterdam',
                postalCode: '1011 DJ',
                stateOrProvince: 'NH',
                country: 'NL',
                firstName: 'John'
            },
            payPalOrder: { id: 'order-id' }
        };
        httpGetMock.mockResolvedValue(orderDetails);

        const loadingContext = 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
        const result = await requestPayPalOrderDetails(loadingContext, {
            clientKey: 'test_client_key',
            merchantId: 'test_merchant',
            orderId: 'order-id'
        });

        expect(httpGetMock).toHaveBeenCalledTimes(1);
        expect(httpGetMock).toHaveBeenCalledWith({
            loadingContext,
            path: 'utility/v1/payPal/test_merchant/orders/order-id?clientKey=test_client_key',
            errorLevel: 'fatal'
        });
        expect(result).toBe(orderDetails);
    });

    test('should reject when httpGet rejects', async () => {
        httpGetMock.mockRejectedValue(new Error('Network error'));

        await expect(
            requestPayPalOrderDetails('https://loading-context/', { clientKey: 'abc', merchantId: 'merchant', orderId: 'order' })
        ).rejects.toThrow('Network error');
    });
});
