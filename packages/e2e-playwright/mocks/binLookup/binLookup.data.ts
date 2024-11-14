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

export {
    optionalDateAndCvcMock,
    hiddenDateAndCvcMock,
    optionalDateWithPanLengthMock,
    hiddenDateWithPanLengthMock,
    optionalDateAndCvcWithPanLengthMock,
    multiLengthMaestroWithPanLengthMock,
    amexWithPanLengthMock
};
