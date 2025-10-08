const optionalDateAndCvcMock = {
    brands: [
        {
            brand: 'mc',
            enableLuhnCheck: true,
            supported: true,
            cvcPolicy: 'optional',
            expiryDatePolicy: 'optional'
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const optionalDateAndCvcWithPanLengthMock = {
    brands: [
        {
            brand: 'mc',
            enableLuhnCheck: true,
            supported: true,
            cvcPolicy: 'optional',
            expiryDatePolicy: 'optional',
            panLength: 16
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const hiddenDateAndCvcMock = {
    brands: [
        {
            brand: 'mc',
            enableLuhnCheck: true,
            supported: true,
            cvcPolicy: 'hidden',
            expiryDatePolicy: 'hidden'
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const hiddenDateAndRequiredCvcMock = {
    brands: [
        {
            brand: 'mc',
            enableLuhnCheck: true,
            supported: true,
            cvcPolicy: 'required',
            expiryDatePolicy: 'hidden'
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const optionalDateWithPanLengthMock = {
    brands: [
        {
            brand: 'mc',
            enableLuhnCheck: true,
            supported: true,
            cvcPolicy: 'required',
            expiryDatePolicy: 'optional',
            panLength: 16
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const hiddenDateWithPanLengthMock = {
    brands: [
        {
            brand: 'mc',
            enableLuhnCheck: true,
            supported: true,
            cvcPolicy: 'required',
            expiryDatePolicy: 'hidden',
            panLength: 16
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const multiLengthMaestroWithPanLengthMock = {
    brands: [
        {
            enableLuhnCheck: true,
            supported: true,
            brand: 'maestro',
            cvcPolicy: 'required',
            expiryDatePolicy: 'required',
            panLength: 18
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const amexWithPanLengthMock = {
    brands: [
        {
            enableLuhnCheck: true,
            supported: true,
            brand: 'amex',
            cvcPolicy: 'required',
            expiryDatePolicy: 'required',
            panLength: 15
        }
    ],
    issuingCountryCode: 'US',
    requestedId: null
};

const kcpMockOptionalDateAndCvcWithPanLengthMock = {
    brands: [
        {
            enableLuhnCheck: true,
            supported: true,
            brand: 'korean_local_card',
            cvcPolicy: 'optional',
            expiryDatePolicy: 'optional',
            panLength: 16
        }
    ],
    requestedId: null,
    issuingCountryCode: 'KR'
};

const socialSecurityNumberRequiredMock = {
    brands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true,
            showSocialSecurityNumber: true
        }
    ],
    issuingCountryCode: 'BR',
    requestId: null
};

const dualBrandBCMCWithMCCvcRequiredMock = {
    brands: [
        {
            brand: 'mc',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'MasterCard',
            paymentMethodVariant: 'mcstandarddebit',
            showSocialSecurityNumber: false,
            supported: true
        },
        {
            brand: 'bcmc',
            cvcPolicy: 'hidden',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'Bancontact card',
            panLength: 16,
            paymentMethodVariant: 'bcmc',
            showSocialSecurityNumber: false,
            supported: true
        }
    ],
    issuingCountryCode: 'BE',
    requestId: null
};

export {
    optionalDateAndCvcMock,
    hiddenDateAndCvcMock,
    hiddenDateAndRequiredCvcMock,
    optionalDateWithPanLengthMock,
    hiddenDateWithPanLengthMock,
    optionalDateAndCvcWithPanLengthMock,
    multiLengthMaestroWithPanLengthMock,
    amexWithPanLengthMock,
    kcpMockOptionalDateAndCvcWithPanLengthMock,
    socialSecurityNumberRequiredMock,
    dualBrandBCMCWithMCCvcRequiredMock
};
