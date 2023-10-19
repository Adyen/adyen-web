import { SESSION_DATA_MOCK, ORDER_DATA_MOCK } from '../../tests/utils/constants';

const paymentDetailsPartiallyAuthorisedAncvMockData = {
    order: {
        amount: {
            currency: 'EUR',
            value: 2001
        },
        expiresAt: '2023-10-10T13:12:59.00Z',
        orderData: ORDER_DATA_MOCK,
        pspReference: 'MHCDBZCH4NF96292',
        reference: 'ABC123',
        remainingAmount: {
            currency: 'EUR',
            value: 100
        }
    },
    resultCode: 'PartiallyAuthorised',
    sessionData: SESSION_DATA_MOCK
};

export { paymentDetailsPartiallyAuthorisedAncvMockData };
