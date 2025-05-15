import { SHOPPER_REFERENCE } from '../../../config/commonConfig';

const mockRegistractionOptions = {
    enrollmentId: 'urn:Iniciador:d71e9826-37f0-4585-a6ff-0e273bbd1ab2',
    challenge: 'ZC-rnlucudt1dczpMvyrq82gZEAfg4Hkyb9DDgAYIU0',
    rp: {
        id: window.location.host,
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

const mockAuthOptions = {
    challenge: 'TXjSIQzUJjIflvyFrDHY2iNQeH3Pzhy6GwbJ91bErto',
    allowCredentials: [
        {
            id: 'spm3BqHW-hFugeKUO5oVFIkzol6K5vxJVenHcuHHBLM',
            type: 'public-key'
        }
    ],
    timeout: 60000,
    userVerification: 'required',
    rpId: 'localhost'
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
    redirectResult: 'xxx'
};

export const mockDetailsResponseRedirectEnrollment = {
    resultCode: 'RedirectShopper',
    action: {
        paymentMethodType: 'paybybank_pix',
        url: 'https://localhost:3020/iframe.html?globals=&args=&id=components-paybybankpix--merchant-page&viewMode=story',
        method: 'GET',
        type: 'redirect'
    }
};

export const mockPaymentsResponseEnrollment = {
    resultCode: 'RedirectShopper',
    action: {
        paymentMethodType: 'paybybank_pix',
        url: 'https://localhost:3020/iframe.html?args=&globals=&id=components-paybybankpix--simulate-issuer-page&viewMode=story',
        method: 'GET',
        type: 'redirect'
    }
};

export const mockPaymentsResponsePayment = {
    resultCode: 'Pending',
    action: {
        paymentMethodType: 'paybybank_pix',
        paymentData: 'mockPaymentData',
        type: 'await',
        paymentMethodData: {
            type: 'pix',
            enrollmentId: 'enrollment123',
            initiationId: 'initiation123'
        }
    }
};

export const mockPendingStatusSimulateHostedPage = {
    resultCode: 'pending'
};

export const mockReceivedStatusSimulateHostedPage = {
    resultCode: 'received',
    registrationOptions: btoa(JSON.stringify(mockRegistractionOptions))
};

export const mockReceivedStatusPayment = {
    resultCode: 'received',
    authorizationOptions: btoa(JSON.stringify(mockAuthOptions))
};

export const mockSubmitDetailsResponseSimulateHostedPage = {
    resultCode: 'Pending',
    action: {
        paymentMethodType: 'paybybank_pix',
        paymentData: 'mockPaymentData',
        type: 'await',
        paymentMethodData: {
            type: 'pix',
            enrollmentId: 'enrollment123'
        }
    }
};

export const mockSubmitDetailsResponseMerchantPage = {};

export const mockRedirectUrlIssuerPage =
    'https://localhost:3020/iframe.html?args=&globals=&id=components-paybybankpix--hosted-page-enrollment&viewMode=story&redirectResult=xxxxxxx&pollStatus=pending';

export const mockEnrollmentPayload = {
    returnUrl: `${window.location.protocol}://localhost:3020/iframe.html?args=&globals=&id=components-paybybankpix--hosted-page-enrollment&viewMode=story`,
    socialSecurityNumber: '81421811006',
    recurringProcessingModel: 'CardOnFile',
    shopperInteraction: 'ContAuth',
    shopperReference: SHOPPER_REFERENCE,
    shopperName: {
        firstName: 'Yu',
        lastName: 'Long'
    }
};
