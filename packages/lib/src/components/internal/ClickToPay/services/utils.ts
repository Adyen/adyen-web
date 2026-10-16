import { CardsByUsage, CardTypes, ClickToPayCheckoutPayload, SrcProfileWithScheme, UsedShopperCard } from './types';
import { SrciCheckoutResponse } from './sdks/types';
import ShopperCard from '../models/ShopperCard';
import SrciError from './sdks/SrciError';

export const CTP_IFRAME_NAME = 'ctpIframe';

/**
 * Creates the payload for the /payments call
 */
function createCheckoutPayloadBasedOnScheme(
    card: ShopperCard,
    srciCheckoutResponse: SrciCheckoutResponse,
    environment: string
): ClickToPayCheckoutPayload {
    const { scheme, tokenId, srcDigitalCardId, srcCorrelationId } = card;

    switch (scheme) {
        case 'visa':
            /**
             * For test environment, we are using hardcoded tokenId
             */
            return tokenId
                ? {
                      srcScheme: scheme,
                      srcCorrelationId,
                      srcTokenReference: environment.toLowerCase().includes('live') ? tokenId : '987654321'
                  }
                : { srcScheme: scheme, srcCheckoutPayload: srciCheckoutResponse.checkoutResponse, srcCorrelationId };
        case 'mc':
        default:
            return { srcScheme: scheme, srcDigitalCardId, srcCorrelationId };
    }
}

function createShopperMaskedCardsData(memo: ShopperCard[], srcProfile: SrcProfileWithScheme): ShopperCard[] {
    const { profiles, srcCorrelationId } = srcProfile;

    const cards: ShopperCard[] = profiles.reduce((memo: ShopperCard[], profile) => {
        const profileCards: ShopperCard[] = profile.maskedCards.map(maskedCard => new ShopperCard(maskedCard, srcProfile.scheme, srcCorrelationId));
        return [...memo, ...profileCards];
    }, []);

    return [...memo, ...cards];
}

function sortCardByLastTimeUsed(card1: UsedShopperCard, card2: UsedShopperCard) {
    return new Date(card2.dateOfCardLastUsed).getTime() - new Date(card1.dateOfCardLastUsed).getTime();
}

function sortCardByLastTimeCreated(card1: ShopperCard, card2: ShopperCard) {
    return new Date(card2.dateOfCardCreated).getTime() - new Date(card1.dateOfCardCreated).getTime();
}

function splitAvailableAndExpiredCards(memo: CardTypes, card: ShopperCard): CardTypes {
    if (card.isExpired) memo.expiredCards.push(card);
    else memo.availableCards.push(card);
    return memo;
}

function hasBeenUsed(card: ShopperCard): card is UsedShopperCard {
    return !!card.dateOfCardLastUsed;
}

function splitCardsByUsage(cards: ShopperCard[]): CardsByUsage {
    return cards.reduce<CardsByUsage>(
        (memo, card) => {
            if (hasBeenUsed(card)) memo.usedCards.push(card);
            else memo.unusedCards.push(card);
            return memo;
        },
        { usedCards: [], unusedCards: [] }
    );
}

/**
 * Creates the Shopper card list. The available cards are placed before the expired cards
 */
function createShopperCardsList(srcProfiles: SrcProfileWithScheme[]): ShopperCard[] {
    const cards: ShopperCard[] = srcProfiles.reduce<ShopperCard[]>((memo, srcProfile) => createShopperMaskedCardsData(memo, srcProfile), []);
    const { availableCards, expiredCards } = cards.reduce<CardTypes>((memo, card) => splitAvailableAndExpiredCards(memo, card), {
        availableCards: [],
        expiredCards: []
    });
    const available = splitCardsByUsage(availableCards);
    const expired = splitCardsByUsage(expiredCards);

    return [
        ...available.usedCards.sort(sortCardByLastTimeUsed),
        ...available.unusedCards.sort(sortCardByLastTimeCreated),
        ...expired.usedCards.sort(sortCardByLastTimeUsed),
        ...expired.unusedCards
    ];
}

function isSrciError(error: unknown): error is SrciError {
    if ((error as SrciError).reason) return true;
    return false;
}

export { createShopperCardsList, createCheckoutPayloadBasedOnScheme, isSrciError };
