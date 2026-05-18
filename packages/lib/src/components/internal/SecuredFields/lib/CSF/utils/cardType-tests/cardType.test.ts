/* global expect, describe, jest, beforeEach */
import CardType from '../cardType';
import { CVC_POLICY_HIDDEN, CVC_POLICY_OPTIONAL } from '../../../constants';

const allCards: string[] = CardType.allCards.map(pCard => pCard.cardType);

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

const reorderCards = (brand: string): string[] => {
    const reorderedCards = [brand, ...allCards.filter(c => c !== brand)];
    return reorderedCards;
};

describe('Top level checks for recognising card brands (confirm that at least one instance of the pattern returns the correct card)', () => {
    test('Should return a mc card', () => {
        const card = CardType.detectCard('55', allCards);
        expect(card.cardType).toEqual('mc');
    });

    test('Should return a visadankort card', () => {
        const card = CardType.detectCard('4571', allCards);
        expect(card.cardType).toEqual('visadankort');
    });

    test('Should return a visa card', () => {
        const card = CardType.detectCard('4', allCards);
        expect(card.cardType).toEqual('visa');
    });

    test('Should return a amex card', () => {
        const card = CardType.detectCard('37', allCards);
        expect(card.cardType).toEqual('amex');
    });

    test('Should return a diners card', () => {
        const card = CardType.detectCard('36', allCards);
        expect(card.cardType).toEqual('diners');
    });

    test('Should return a maestrouk card', () => {
        const card = CardType.detectCard('6759', allCards);
        expect(card.cardType).toEqual('maestrouk');
    });

    test('Should return a solo card', () => {
        const card = CardType.detectCard('6767', allCards);
        expect(card.cardType).toEqual('solo');
    });

    test('Should return a laser card', () => {
        const card = CardType.detectCard('6304', allCards);
        expect(card.cardType).toEqual('laser');
        expect(card.cvcPolicy).toBe(CVC_POLICY_OPTIONAL);
    });

    test('Should return a discover card', () => {
        const card = CardType.detectCard('6011', allCards);
        expect(card.cardType).toEqual('discover');
    });

    test('Should return a jcb card', () => {
        const card = CardType.detectCard('3528', allCards);
        expect(card.cardType).toEqual('jcb');
    });

    test('Should return a bcmc card', () => {
        const card = CardType.detectCard('6703', allCards);
        expect(card.cardType).toEqual('bcmc');
        expect(card.cvcPolicy).toBe(CVC_POLICY_HIDDEN);
    });

    test('Should return a bijcard card when it is first in the list', () => {
        const reorderedCards = reorderCards('bijcard');
        const card = CardType.detectCard('5100081', reorderedCards);
        expect(card.cardType).toEqual('bijcard');
    });

    test('Should return a dankort card', () => {
        const card = CardType.detectCard('5019', allCards);
        expect(card.cardType).toEqual('dankort');
    });

    test('Should return a hipercard card', () => {
        const card = CardType.detectCard('606282', allCards);
        expect(card.cardType).toEqual('hipercard');
    });

    test('Should return a cup card', () => {
        const card = CardType.detectCard('62', allCards);
        expect(card.cardType).toEqual('cup');
    });

    test('Should return a maestro card when it is first in the list', () => {
        const reorderedCards = reorderCards('maestro');
        const card = CardType.detectCard('50', reorderedCards);
        expect(card.cardType).toEqual('maestro');
        expect(card.cvcPolicy).toBe('optional');
    });

    test('Should return a elo card when it is first in the list', () => {
        const reorderedCards = reorderCards('elo');
        const card = CardType.detectCard('506699', reorderedCards);
        expect(card.cardType).toEqual('elo');
    });

    test('Should return a uatp card', () => {
        const card = CardType.detectCard('1', allCards);
        expect(card.cardType).toEqual('uatp');
        expect(card.cvcPolicy).toBe(CVC_POLICY_OPTIONAL);
    });

    test('Should return a cartebancaire card when it is first in the list', () => {
        const reorderedCards = reorderCards('cartebancaire');
        const card = CardType.detectCard('5', reorderedCards);
        expect(card.cardType).toEqual('cartebancaire');
    });

    test('Should return a visaalphabankbonus card when it is first in the list', () => {
        const reorderedCards = reorderCards('visaalphabankbonus');
        const card = CardType.detectCard('450903', reorderedCards);
        expect(card.cardType).toEqual('visaalphabankbonus');
    });

    test('Should return a mcalphabankbonus card when it is first in the list', () => {
        const reorderedCards = reorderCards('mcalphabankbonus');
        const card = CardType.detectCard('510099', reorderedCards);
        expect(card.cardType).toEqual('mcalphabankbonus');
    });

    test('Should return a hiper card when it is first in the list', () => {
        const reorderedCards = reorderCards('hiper');
        const card = CardType.detectCard('637095', reorderedCards);
        expect(card.cardType).toEqual('hiper');
    });

    test('Should return a oasis card', () => {
        const card = CardType.detectCard('982616', allCards);
        expect(card.cardType).toEqual('oasis');
        expect(card.cvcPolicy).toBe(CVC_POLICY_OPTIONAL);
    });

    test('Should return a karenmillen card', () => {
        const card = CardType.detectCard('98261465', allCards);
        expect(card.cardType).toEqual('karenmillen');
        expect(card.cvcPolicy).toBe(CVC_POLICY_OPTIONAL);
    });

    test('Should return a warehouse card', () => {
        const card = CardType.detectCard('982633', allCards);
        expect(card.cardType).toEqual('warehouse');
        expect(card.cvcPolicy).toBe(CVC_POLICY_OPTIONAL);
    });

    test('Should return a mir card when it is first in the list', () => {
        const reorderedCards = reorderCards('mir');
        const card = CardType.detectCard('220', reorderedCards);
        expect(card.cardType).toEqual('mir');
    });

    test('Should return a codensa card when it is first in the list', () => {
        const reorderedCards = reorderCards('codensa');
        const card = CardType.detectCard('590712', reorderedCards);
        expect(card.cardType).toEqual('codensa');
    });

    test('Should return a naranja card when it is first in the list', () => {
        const reorderedCards = reorderCards('naranja');
        const card = CardType.detectCard('377798', reorderedCards);
        expect(card.cardType).toEqual('naranja');
    });

    test('Should return a cabal card when it is first in the list', () => {
        const reorderedCards = reorderCards('cabal');
        const card = CardType.detectCard('636908', reorderedCards); // ok
        expect(card.cardType).toEqual('cabal');
    });

    test('Should return a shopping card when it is first in the list', () => {
        const reorderedCards = reorderCards('shopping');
        const card = CardType.detectCard('2799', reorderedCards);
        expect(card.cardType).toEqual('shopping');
    });

    test('Should return a argencard card when it is first in the list', () => {
        const reorderedCards = reorderCards('argencard');
        const card = CardType.detectCard('501', reorderedCards);
        expect(card.cardType).toEqual('argencard');
    });

    test('Should return a troy card', () => {
        const card = CardType.detectCard('9792', allCards);
        expect(card.cardType).toEqual('troy');
    });

    test('Should return a vpay card when it is first in the list', () => {
        const reorderedCards = reorderCards('vpay');
        const card = CardType.detectCard('413', reorderedCards);
        expect(card.cardType).toEqual('vpay');
    });
});
