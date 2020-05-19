/* global expect, describe, jest, beforeEach */
import CardType from '../cardType';

const allCards = CardType.allCards.map(pCard => pCard.cardType);

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

describe('Deeper level checks for visa brand recognition', () => {
    test('Should return a visa card - deep level 1', () => {
        const card = CardType.detectCard('40', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 2', () => {
        const card = CardType.detectCard('41', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 3', () => {
        const card = CardType.detectCard('42', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 4', () => {
        const card = CardType.detectCard('43', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 5', () => {
        const card = CardType.detectCard('44', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 6', () => {
        const card = CardType.detectCard('45', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 7', () => {
        const card = CardType.detectCard('46', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 8', () => {
        const card = CardType.detectCard('47', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 9', () => {
        const card = CardType.detectCard('48', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 10', () => {
        const card = CardType.detectCard('49', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 11 (16 digit)', () => {
        const card = CardType.detectCard('4111111111111111', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a visa card - deep level 12 (19 digit)', () => {
        const card = CardType.detectCard('4111111111111111222', allCards);
        expect(card.cardType).toEqual('visa');
    });
});
