const nextYear = String(new Date().getFullYear() + 1);

/**
 * SRC profile returned by the mocked Mastercard SDK for a recognized shopper: one active, non-expired card
 */
const recognizedShopperSrcProfile = {
    srcCorrelationId: 'mock-src-correlation-id',
    profiles: [
        {
            maskedCards: [
                {
                    srcDigitalCardId: 'mock-src-digital-card-id',
                    panLastFour: '4444',
                    dateOfCardCreated: '2024-01-01T00:00:00.000Z',
                    dateOfCardLastUsed: '2024-06-01T00:00:00.000Z',
                    paymentCardDescriptor: 'mastercard',
                    panExpirationMonth: '12',
                    panExpirationYear: nextYear,
                    digitalCardData: {
                        descriptorName: 'Mastercard',
                        artUri: '',
                        status: 'ACTIVE'
                    }
                }
            ]
        }
    ]
};

export { recognizedShopperSrcProfile };
