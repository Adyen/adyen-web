import { SESSION_DATA_MOCK, ORDER_DATA_MOCK, SESSION_RESULT_MOCK } from '../../tests/utils/constants';

const paymentsActionAncvMockData = {
    action: {
        paymentData: SESSION_DATA_MOCK,
        paymentMethodType: 'ancv',
        type: 'await'
    },
    order: {
        amount: {
            currency: 'EUR',
            value: 2001
        },
        expiresAt: '2023-10-10T13:12:59.00Z',
        orderData: ORDER_DATA_MOCK,
        pspReference: 'MHCDBZCH4NF96292',
        reference: 'ABC123'
    },
    resultCode: 'Pending',
    sessionData: SESSION_DATA_MOCK,
    sessionResult: SESSION_RESULT_MOCK
};

const paymentsSuccessCardMockData = {
    order: {
        amount: {
            currency: 'EUR',
            value: 2001
        },
        expiresAt: '2023-10-10T13:12:59.00Z',
        pspReference: 'MHCDBZCH4NF96292',
        reference: 'ABC123',
        remainingAmount: {
            currency: 'EUR',
            value: 0
        }
    },
    resultCode: 'Authorised',
    sessionData: SESSION_DATA_MOCK,
    sessionResult: SESSION_RESULT_MOCK
};

export { paymentsActionAncvMockData, paymentsSuccessCardMockData };
