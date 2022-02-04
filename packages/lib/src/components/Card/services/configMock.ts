export type SecureRemoteCommerceInitResult = {
    srciTransactionId: string;
    srcInitiatorId: string;
    srciDpaId: string;
    dpaData: any;
    dpaTransactionOptions: any;
};

const initParams: SecureRemoteCommerceInitResult = {
    srciTransactionId: 'adyen-id-290202020',
    srcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
    srciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
    dpaData: {
        //  "srcDpaId": "8e6e347c-254e-863f-0e6a-196bf2d9df02",
        dpaPresentationName: 'Adyen Visa Click to Play Sandbox',
        dpaUri: 'https://www.adyen.com',
        dpaThreeDsPreference: 'UNKNOWN'
    },
    dpaTransactionOptions: {
        dpaLocale: 'en_US',
        dpaAcceptedBillingCountries: ['US', 'CA', 'NL'],
        dpaAcceptedShippingCountries: ['US', 'CA', 'NL'],
        dpaBillingPreference: 'ALL',
        dpaShippingPreference: 'ALL',
        consumerNameRequested: true,
        consumerEmailAddressRequested: true,
        consumerPhoneNumberRequested: true,
        paymentOptions: {
            dynamicDataType: 'TAVV',
            dpaPanRequested: false
        },
        reviewAction: 'continue',
        checkoutDescription: 'Sample checkout',
        transactionType: 'PURCHASE',
        orderType: 'REAUTHORIZATION',
        payloadTypeIndicator: 'PAYMENT',
        //  "merchantOrderId": "order-id-" + txId,
        merchantCategoryCode: '5734',
        merchantCountryCode: 'US'
    }
};

type CtpConfig = Record<string, SecureRemoteCommerceInitResult>;

const configMock: CtpConfig = {
    visa: initParams
};

export { configMock };
