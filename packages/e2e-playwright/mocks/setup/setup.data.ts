import { SESSION_DATA_MOCK } from '../../tests/utils/constants';

const setupMockData = {
    amount: { currency: 'EUR', value: 2000 },
    countryCode: 'FR',
    expiresAt: '2023-10-10T14:27:12+02:00',
    id: 'CSC9B0D869C74EC53D',
    returnUrl: 'http://localhost:3024/',
    shopperLocale: 'en-US',
    configuration: { enableStoreDetails: false },
    paymentMethods: {
        paymentMethods: [
            {
                brands: [
                    'cartebancaire',
                    'visa',
                    'mc',
                    'amex',
                    'maestro',
                    'accel',
                    'bijcard',
                    'cup',
                    'diners',
                    'discover',
                    'jcb',
                    'nyce',
                    'pulse',
                    'sodexo',
                    'star',
                    'vale_refeicao',
                    'vale_refeicao_prepaid'
                ],
                name: 'Credit Card',
                type: 'scheme'
            },
            { name: 'ANCV', type: 'ancv' }
        ]
    },
    sessionData: SESSION_DATA_MOCK
};

const setupWithAncvOrderMockData = {
    amount: {
        currency: 'EUR',
        value: 2001
    },
    countryCode: 'FR',
    expiresAt: '2023-10-10T15:12:59+02:00',
    id: 'CS9094FF58AB7D9B23',
    returnUrl: 'http://localhost:3020/result',
    shopperLocale: 'en-US',
    configuration: {
        enableStoreDetails: false
    },
    paymentMethods: {
        paymentMethods: [
            {
                brands: ['visa', 'mc', 'amex', 'bijcard', 'cartebancaire', 'diners', 'discover', 'jcb', 'maestro', 'ticket', 'uatp'],
                name: 'Credit Card',
                type: 'scheme'
            },
            {
                name: 'ANCV',
                type: 'ancv'
            }
        ]
    },
    sessionData: SESSION_DATA_MOCK
};

export { setupMockData, setupWithAncvOrderMockData };
