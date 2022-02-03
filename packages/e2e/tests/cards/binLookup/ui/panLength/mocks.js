const brandBase = {
    brand: 'mc',
    enableLuhnCheck: true,
    supported: true
};

const mockBase = {
    issuingCountryCode: 'US',
    requestId: null
};

export const mocks = {
    noPanLength: {
        brands: [
            {
                ...brandBase,
                cvcPolicy: 'required',
                expiryDatePolicy: 'required'
            }
        ],
        ...mockBase
    },
    panLength: {
        brands: [
            {
                ...brandBase,
                cvcPolicy: 'required',
                expiryDatePolicy: 'required',
                panLength: 16
            }
        ],
        ...mockBase
    },
    optionalDate: {
        brands: [
            {
                ...brandBase,
                cvcPolicy: 'required',
                expiryDatePolicy: 'optional',
                panLength: 16
            }
        ],
        ...mockBase
    },
    hiddenDate: {
        brands: [
            {
                ...brandBase,
                cvcPolicy: 'required',
                expiryDatePolicy: 'hidden',
                panLength: 16
            }
        ],
        ...mockBase
    },
    optionalDateAndCVC: {
        brands: [
            {
                ...brandBase,
                cvcPolicy: 'optional',
                expiryDatePolicy: 'optional',
                panLength: 16
            }
        ],
        ...mockBase
    },
    multiLengthMaestro: {
        brands: [
            {
                ...brandBase,
                brand: 'maestro',
                cvcPolicy: 'required',
                expiryDatePolicy: 'required',
                panLength: 18
            }
        ],
        ...mockBase
    },
    visaMock: {
        brands: [
            {
                ...brandBase,
                brand: 'visa',
                cvcPolicy: 'required',
                expiryDatePolicy: 'required',
                panLength: 16
            }
        ],
        ...mockBase
    }
};
