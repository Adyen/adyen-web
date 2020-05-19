/* global expect, describe, jest, beforeEach */
import CardType from '../cardType';

const allCards = CardType.allCards.map(pCard => pCard.cardType);

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

describe('Deeper level checks for mastercard brand recognition', () => {
    test('Should return a mc card - deep level 1', () => {
        const card = CardType.detectCard('51', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 2', () => {
        const card = CardType.detectCard('52', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 3', () => {
        const card = CardType.detectCard('53', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 4', () => {
        const card = CardType.detectCard('54', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 5', () => {
        const card = CardType.detectCard('55', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 6 (expect fail)', () => {
        const card = CardType.detectCard('21', allCards);
        expect(card.cardType).toEqual('noBrand');
    });

    test('Should return a mc card- deep level 7', () => {
        const card = CardType.detectCard('22', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 8', () => {
        const card = CardType.detectCard('23', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 9', () => {
        const card = CardType.detectCard('24', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 10', () => {
        const card = CardType.detectCard('25', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 11', () => {
        const card = CardType.detectCard('26', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 12', () => {
        const card = CardType.detectCard('27', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a mc card- deep level 13 (expect fail)', () => {
        const card = CardType.detectCard('28', allCards);
        expect(card.cardType).toEqual('noBrand');
    });

    test('Should return a mc card- deep level 14', () => {
        const card = CardType.detectCard('5500000000000004', allCards);
        expect(card.cardType).toEqual('mc');
    });
});
