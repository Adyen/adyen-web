/* global expect, describe, jest, beforeEach */
import CardType from '../cardType';

const allCards = CardType.allCards.map(pCard => pCard.cardType);

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

describe('Test for cardType.detectCardLength functionality', () => {
    // AMEX
    test('Should return an object stating the amex number is at a valid length & has a maxLength of 2 chars more than the number length (amex spacing)', () => {
        const card = CardType.detectCard('37', allCards);

        const cardLenObj = CardType.detectCardLength(card, '370000000000002'); // max number length for amex (15 digits)

        expect(cardLenObj.reachedValidLength).toBe(true);
        expect(cardLenObj.maxLength).toEqual(17); // i.e. '3700 000000 00002'
    });

    test('Should return an object stating the amex number is at a valid length, has a maxLength of 2 chars more than the number length and should have truncated the number', () => {
        const card = CardType.detectCard('37', allCards);

        const cardLenObj = CardType.detectCardLength(card, '370000000000002000');

        expect(cardLenObj.reachedValidLength).toBe(true);
        expect(cardLenObj.maxLength).toEqual(17);
        expect(cardLenObj.shortenedNewValue).toEqual('370000000000002');
    });

    test('Should return an object stating the amex number is not at a valid length', () => {
        const card = CardType.detectCard('37', allCards);

        const cardLenObj = CardType.detectCardLength(card, '37000000000000'); // 1 digit short

        expect(cardLenObj.reachedValidLength).toBe(false);
    });

    // VISA
    test('Should return an object stating the visa number is at a valid length & has a maxLength of 4 chars more than the number length (standard spacing)', () => {
        const card = CardType.detectCard('41', allCards);

        const cardLenObj = CardType.detectCardLength(card, '4111111111111111222'); // max number length for visa (19 digits)

        expect(cardLenObj.reachedValidLength).toBe(true);
        expect(cardLenObj.maxLength).toEqual(23); // i.e. 4111 1111 1111 1111 111'
    });

    test('Should return an object stating the visa number is not at a valid length ', () => {
        const card = CardType.detectCard('41', allCards);
        const cardLenObj = CardType.detectCardLength(card, '411111111111111122'); // 18 digits (invalid length, but 1 digit short of max possible length)

        expect(cardLenObj.reachedValidLength).toBe(false);
    });

    test('Should return an object stating the visa number is at a valid length & has a maxLength of 4 chars more than the number length (standard spacing) and should truncate the number', () => {
        const card = CardType.detectCard('41', allCards);

        const cardLenObj = CardType.detectCardLength(card, '4111111111111111222333');

        expect(cardLenObj.reachedValidLength).toBe(true);
        expect(cardLenObj.maxLength).toEqual(23);
        expect(cardLenObj.shortenedNewValue).toEqual('4111111111111111222');
    });

    // MC
    test('Should return an object stating the mc number is at a valid length & has a maxLength of 3 chars more than the number length (standard spacing)', () => {
        const card = CardType.detectCard('55', allCards);

        const cardLenObj = CardType.detectCardLength(card, '5500000000000004'); // max number length for mc (16 digits)

        expect(cardLenObj.reachedValidLength).toBe(true);
        expect(cardLenObj.maxLength).toEqual(19); // i.e. 5500 0000 0000 0004'
    });

    test('Should return an object stating the mc number is at a valid length & has a maxLength of 3 chars more than the number length (standard spacing) and should truncate the number', () => {
        const card = CardType.detectCard('55', allCards);

        const cardLenObj = CardType.detectCardLength(card, '5500000000000004999');

        expect(cardLenObj.reachedValidLength).toBe(true);
        expect(cardLenObj.maxLength).toEqual(19);
        expect(cardLenObj.shortenedNewValue).toEqual('5500000000000004');
    });

    test('Should return an object stating the mc number is not at a valid length ', () => {
        const card = CardType.detectCard('55', allCards);

        const cardLenObj = CardType.detectCardLength(card, '550000000000000'); // 15 digits (invalid length)

        expect(cardLenObj.reachedValidLength).toBe(false);
    });
});
