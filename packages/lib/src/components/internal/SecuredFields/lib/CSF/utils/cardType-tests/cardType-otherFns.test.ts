/* global expect, describe, jest, beforeEach */
import CardType from '../cardType';

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

describe('Tests for cardType.getShortestPermittedCardLength & getCardByBrand functionality', () => {
    test('Should return 13 - the shortest length we consider valid for a credit card number (visa)', () => {
        expect(CardType.getShortestPermittedCardLength()).toEqual(13);
    });

    test('Should return a visa card', () => {
        const card = CardType.getCardByBrand('visa');
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a "noBrand" card, since we are typing a visa number but not passing an array of allowed card types', () => {
        const card = CardType.detectCard('41');
        expect(card.cardType).toEqual(CardType.__NO_BRAND);
    });

    test('Should recognise "card" as being of "generic" type', () => {
        const isGenericCardType = CardType.isGenericCardType('card');
        expect(isGenericCardType).toBe(true);
    });

    test('Should recognise "scheme" as being of "generic" type', () => {
        const isGenericCardType = CardType.isGenericCardType('scheme');
        expect(isGenericCardType).toBe(true);
    });

    test('Should throw error since a type argument has not been passed', () => {
        expect(() => {
            // @ts-ignore Expected to complain as the argument is missing
            CardType.isGenericCardType();
        }).toThrow('Error: isGenericCardType: type param has not been specified');
    });

    test('Should not recognise "visa" as being of "generic" type', () => {
        const isGenericCardType = CardType.isGenericCardType('visa');
        expect(isGenericCardType).toBe(false);
    });
});
