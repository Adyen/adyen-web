/* global expect, describe, jest, beforeEach */
import CardType from '../cardType';

const allCards = CardType.allCards.map(pCard => pCard.cardType);

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

describe('Deeper level checks for amex brand recognition', () => {
    test('Should return a amex card - deep level 1', () => {
        const card = CardType.detectCard('34', allCards);
        expect(card.cardType).toEqual('amex');
    });

    test('Should return a amex card - deep level 2', () => {
        const card = CardType.detectCard('37', allCards);
        expect(card.cardType).toEqual('amex');
    });

    test('Should return a amex card - deep level 3', () => {
        const card = CardType.detectCard('370000000000002', allCards);
        expect(card.cardType).toEqual('amex');
    });
});
