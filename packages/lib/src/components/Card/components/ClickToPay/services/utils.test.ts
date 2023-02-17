import { createShopperCardsList } from './utils';
import { SrcProfileWithScheme } from './types';
import ShopperCard from '../models/ShopperCard';

test('should place expired cards at the end of the list, placing the most recent ones on top', () => {
    const cardsFromSrcSystem: SrcProfileWithScheme[] = [
        {
            scheme: 'visa',
            srcCorrelationId: '123456',
            profiles: [
                {
                    maskedCards: [
                        {
                            srcDigitalCardId: 'xxxx',
                            panLastFour: '8902',
                            dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
                            paymentCardDescriptor: 'visa',
                            panExpirationMonth: '12',
                            panExpirationYear: '2020',
                            digitalCardData: {
                                descriptorName: 'Visa',
                                artUri: 'https://image.com/visa',
                                status: 'EXPIRED'
                            },
                            tokenId: '9w8e8e'
                        },
                        {
                            srcDigitalCardId: 'xxxxxx',
                            panLastFour: '8902',
                            dateOfCardLastUsed: '2022-09-28T08:10:02.312Z',
                            paymentCardDescriptor: 'visa',
                            panExpirationMonth: '12',
                            panExpirationYear: '2025',
                            digitalCardData: {
                                descriptorName: 'Visa',
                                artUri: 'https://image.com/visa',
                                status: 'ACTIVE'
                            },
                            tokenId: '3f3f6g'
                        }
                    ]
                }
            ]
        },
        {
            scheme: 'mc',
            srcCorrelationId: '1a2b3c',
            profiles: [
                {
                    maskedCards: [
                        {
                            srcDigitalCardId: 'yyyy',
                            panLastFour: '4302',
                            dateOfCardLastUsed: '2019-12-25T20:20:02.942Z',
                            paymentCardDescriptor: 'mc',
                            panExpirationMonth: '12',
                            panExpirationYear: '2020',
                            digitalCardData: {
                                descriptorName: 'Mastercard',
                                artUri: 'https://image.com/mc',
                                // MC is only passing ACTIVE even if the card is EXPIRED
                                status: 'ACTIVE'
                            },
                            tokenId: '2a2a3b3b'
                        }
                    ]
                }
            ]
        }
    ];

    const cards: ShopperCard[] = createShopperCardsList(cardsFromSrcSystem);

    expect(cards).toEqual([
        {
            artUri: 'https://image.com/visa',
            dateOfCardLastUsed: '2022-09-28T08:10:02.312Z',
            descriptorName: 'Visa',
            isExpired: false,
            panExpirationMonth: '12',
            panExpirationYear: '2025',
            panLastFour: '8902',
            scheme: 'visa',
            srcCorrelationId: '123456',
            srcDigitalCardId: 'xxxxxx',
            status: 'ACTIVE',
            tokenId: '3f3f6g'
        },
        {
            artUri: 'https://image.com/mc',
            dateOfCardLastUsed: '2019-12-25T20:20:02.942Z',
            descriptorName: 'Mastercard',
            isExpired: true,
            panExpirationMonth: '12',
            panExpirationYear: '2020',
            panLastFour: '4302',
            scheme: 'mc',
            srcCorrelationId: '1a2b3c',
            srcDigitalCardId: 'yyyy',
            status: 'ACTIVE',
            tokenId: '2a2a3b3b'
        },
        {
            artUri: 'https://image.com/visa',
            dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
            descriptorName: 'Visa',
            isExpired: true,
            panExpirationMonth: '12',
            panExpirationYear: '2020',
            panLastFour: '8902',
            scheme: 'visa',
            srcCorrelationId: '123456',
            srcDigitalCardId: 'xxxx',
            status: 'EXPIRED',
            tokenId: '9w8e8e'
        }
    ]);
});

test('should sort available cards placing most recent ones on top of the list', () => {
    const cardsFromSrcSystem: SrcProfileWithScheme[] = [
        {
            scheme: 'visa',
            srcCorrelationId: '123456',
            profiles: [
                {
                    maskedCards: [
                        {
                            srcDigitalCardId: 'xxxx',
                            panLastFour: '8902',
                            dateOfCardLastUsed: '2022-07-25T22:23:22.312Z',
                            paymentCardDescriptor: 'visa',
                            panExpirationMonth: '08',
                            panExpirationYear: '2026',
                            digitalCardData: {
                                descriptorName: 'Visa',
                                artUri: 'https://image.com/visa',
                                status: 'ACTIVE'
                            },
                            tokenId: '9w8e8e'
                        },
                        {
                            srcDigitalCardId: 'xxxxxx',
                            panLastFour: '8902',
                            dateOfCardLastUsed: '2021-12-28T08:10:02.512Z',
                            paymentCardDescriptor: 'visa',
                            panExpirationMonth: '01',
                            panExpirationYear: '2028',
                            digitalCardData: {
                                descriptorName: 'Visa',
                                artUri: 'https://image.com/visa',
                                status: 'ACTIVE'
                            },
                            tokenId: '3f3f6g'
                        }
                    ]
                }
            ]
        },
        {
            scheme: 'mc',
            srcCorrelationId: '1a2b3c',
            profiles: [
                {
                    maskedCards: [
                        {
                            srcDigitalCardId: 'yyyy',
                            panLastFour: '4302',
                            dateOfCardLastUsed: '2022-08-25T20:20:02.942Z',
                            paymentCardDescriptor: 'mc',
                            panExpirationMonth: '03',
                            panExpirationYear: '2030',
                            digitalCardData: {
                                descriptorName: 'Mastercard',
                                artUri: 'https://image.com/mc',
                                status: 'ACTIVE'
                            },
                            tokenId: '2a2a3b3b'
                        }
                    ]
                }
            ]
        }
    ];

    const cards = createShopperCardsList(cardsFromSrcSystem);

    expect(cards).toEqual([
        {
            artUri: 'https://image.com/mc',
            dateOfCardLastUsed: '2022-08-25T20:20:02.942Z',
            descriptorName: 'Mastercard',
            isExpired: false,
            panExpirationMonth: '03',
            panExpirationYear: '2030',
            panLastFour: '4302',
            scheme: 'mc',
            srcCorrelationId: '1a2b3c',
            srcDigitalCardId: 'yyyy',
            status: 'ACTIVE',
            tokenId: '2a2a3b3b'
        },
        {
            artUri: 'https://image.com/visa',
            dateOfCardLastUsed: '2022-07-25T22:23:22.312Z',
            descriptorName: 'Visa',
            isExpired: false,
            panExpirationMonth: '08',
            panExpirationYear: '2026',
            panLastFour: '8902',
            scheme: 'visa',
            srcCorrelationId: '123456',
            srcDigitalCardId: 'xxxx',
            status: 'ACTIVE',
            tokenId: '9w8e8e'
        },
        {
            artUri: 'https://image.com/visa',
            dateOfCardLastUsed: '2021-12-28T08:10:02.512Z',
            descriptorName: 'Visa',
            isExpired: false,
            panExpirationMonth: '01',
            panExpirationYear: '2028',
            panLastFour: '8902',
            scheme: 'visa',
            srcCorrelationId: '123456',
            srcDigitalCardId: 'xxxxxx',
            status: 'ACTIVE',
            tokenId: '3f3f6g'
        }
    ]);
});
