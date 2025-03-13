const mockRegistractionOptions = {
    enrollmentId: 'urn:Iniciador:d71e9826-37f0-4585-a6ff-0e273bbd1ab2',
    challenge: 'ZC-rnlucudt1dczpMvyrq82gZEAfg4Hkyb9DDgAYIU0',
    rp: {
        id: window.location.hostname,
        name: 'Adyen'
    },
    user: {
        id: '8793f81a-822c-4abb-b22a-b2ab99aa14aa',
        name: 'Adyen Passkey Test',
        displayName: 'Adyen Passkey Test'
    },
    pubKeyCredParams: [
        {
            alg: -8,
            type: 'public-key'
        },
        {
            alg: -7,
            type: 'public-key'
        },
        {
            alg: -257,
            type: 'public-key'
        }
    ],
    timeout: 60000,
    attestation: 'direct',
    excludeCredentials: [],
    authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        requireResidentKey: false,
        userVerification: 'required'
    },
    extensions: {
        credProps: true
    }
};

export const mockPaymentsResponseMerchantPage = {
    action: {
        paymentMethodType: 'paybybank_pix',
        type: 'redirect',
        url: 'https://localhost:3020/iframe.html?globals=&args=&id=components-paybybankpix--simulate-hosted-page&viewMode=story', // issuer’s app/page url
        method: 'GET'
    },
    resultCode: 'RedirectShopper'
};

export const mockPostEnrollmentResponse = {
    resultCode: 'RedirectShopper',
    action: {
        paymentMethodType: 'paybybank_pix',
        url: 'https://localhost:3020/iframe.html?globals=&args=&id=components-paybybankpix--merchant-page&viewMode=story',
        method: 'GET',
        type: 'redirect'
    }
};

export const mockPaymentsResponseSimulateHostedPage = {
    resultCode: 'RedirectShopper',
    action: {
        paymentMethodType: 'paybybank_pix',
        url: 'https://localhost:3020/iframe.html?args=&globals=&id=components-paybybankpix--simulate-issuer-page&viewMode=story',
        method: 'GET',
        type: 'redirect'
    }
};
// todo: add non pending status
export const mockPendingStatusSimulateHostedPage = {
    resultCode: 'pending'
};

export const mockReceivedStatusSimulateHostedPage = {
    resultCode: 'received',
    registrationOptions: btoa(JSON.stringify(mockRegistractionOptions))
};

export const mockSubmitDetailsResponseSimulateHostedPage = {
    resultCode: 'Pending',
    action: {
        paymentData: 'mockPaymentData',
        paymentMethodType: 'paybybank_pix',
        enrollmentId: 'enrollment123',
        type: 'await'
    }
};

export const mockSubmitDetailsResponseMerchantPage = {};

export const mockRedirectUrlIssuerPage =
    'https://localhost:3020/iframe.html?globals=&args=&id=components-paybybankpix--simulate-hosted-page&viewMode=story&redirectResult=xxxxxxx&pollStatus=pending';
