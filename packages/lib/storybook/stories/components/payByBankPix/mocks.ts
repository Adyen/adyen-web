export const mockPaymentsResponseMerchantPage = {
    action: {
        paymentMethodType: 'paybybank_pix',
        type: 'redirect',
        url: 'https://localhost:3020/iframe.html?globals=&args=&id=components-paybybankpix--simulate-hosted-page&viewMode=story', // issuer’s app/page url
        method: 'GET'
    },
    resultCode: 'RedirectShopper'
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
    registrationOptions:
        'ewogICAgImFjdGlvbiI6IHsKICAgICAgICAicGF5bWVudE1ldGhvZFR5cGUiOiAicGF5YnliYW5rX3BpeCIsCiAgICAgICAgInR5cGUiOiAiYXdhaXQiLAogICAgICAgICJlbnJvbGxtZW50SWQiOiAiZW5yb2xsbWVudDEyMyIsCiAgICAgICAgInBheW1lbnREYXRhIjogIm1vY2tQYXltZW50RGF0YSIKICAgIH0KfQ=='
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
