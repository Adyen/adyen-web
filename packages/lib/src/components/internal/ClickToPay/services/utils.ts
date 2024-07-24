import { CardTypes, ClickToPayCheckoutPayload, SrcProfileWithScheme } from './types';
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

function sortCardByLastTimeUsed(card1: ShopperCard, card2: ShopperCard) {
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

function splitUnusedAndUsedCards(memo: { unusedCards: ShopperCard[]; usedCards: ShopperCard[] }, card: ShopperCard) {
    if (card.dateOfCardLastUsed) memo.usedCards.push(card);
    else memo.unusedCards.push(card);
    return memo;
}

/**
 * Creates the Shopper card list. The available cards are placed before the expired cards
 */
function createShopperCardsList(srcProfiles: SrcProfileWithScheme[]): ShopperCard[] {
    const cards: ShopperCard[] = srcProfiles.reduce(createShopperMaskedCardsData, []);
    const { availableCards, expiredCards } = cards.reduce(splitAvailableAndExpiredCards, { availableCards: [], expiredCards: [] });
    const { unusedCards, usedCards } = availableCards.reduce(splitUnusedAndUsedCards, { unusedCards: [], usedCards: [] });

    return [...usedCards.sort(sortCardByLastTimeUsed), ...unusedCards.sort(sortCardByLastTimeCreated), ...expiredCards.sort(sortCardByLastTimeUsed)];
}

function isSrciError(error: unknown): error is SrciError {
    if ((error as SrciError).reason) return true;
    return false;
}

export { createShopperCardsList, createCheckoutPayloadBasedOnScheme, isSrciError };
