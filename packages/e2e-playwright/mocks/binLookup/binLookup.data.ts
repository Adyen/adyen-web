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

/**
 * "Regular" bin lookups that often seem to fail in the pipline
 * Fix them to the order in which the tests expect the brands to be returned
 */
const dualBrandedBcmcAndMc = {
    brands: [
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
        },
        {
            brand: 'mc',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'MasterCard',
            paymentMethodVariant: 'mcstandarddebit',
            showSocialSecurityNumber: false,
            supported: true
        }
    ],
    issuingCountryCode: 'BE',
    requestId: 'b293c3aa-dfc0-40a6-87d4-f55fa951d60d'
};

const dualBrandedBcmcAndVisa = {
    brands: [
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
        },
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'VISA',
            paymentMethodVariant: 'visa',
            showSocialSecurityNumber: false,
            supported: true
        }
    ],
    issuingCountryCode: 'BE',
    requestId: 'adf76310-9047-4339-912d-bb6e68f34966'
};

const dualBcmcAndMaestro = {
    brands: [
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
        },
        {
            brand: 'maestro',
            cvcPolicy: 'optional',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'Maestro',
            paymentMethodVariant: 'maestro',
            showSocialSecurityNumber: false,
            supported: true
        }
    ],
    issuingCountryCode: 'BE',
    requestId: '1f69f1e3-ae7c-489a-8ccc-9096d2ce3c19'
};

const dualBrandedVisaAndBcmc = {
    brands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'VISA',
            paymentMethodVariant: 'visa',
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
    requestId: 'ccc09776-5f1b-4ccb-be9d-6171b07dd13c'
};

const dualBrandedMcAndBcmc = {
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
    requestId: '23fada4f-12dc-48f2-9380-873ae3702075'
};

const bcmcOnly = {
    brands: [
        {
            brand: 'bcmc',
            cvcPolicy: 'hidden',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'Bancontact card',
            paymentMethodVariant: 'bcmc',
            showSocialSecurityNumber: false,
            supported: true
        }
    ],
    issuingCountryCode: 'BE',
    requestId: '23fada4f-12dc-48f2-9380-873ae3702075'
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
    // "regular" mocks
    dualBrandedBcmcAndVisa,
    dualBrandedBcmcAndMc,
    dualBcmcAndMaestro,
    dualBrandedVisaAndBcmc,
    dualBrandedMcAndBcmc,
    bcmcOnly
};
