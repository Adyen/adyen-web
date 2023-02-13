import { CardTypes, ClickToPayCheckoutPayload, SrcProfileWithScheme } from './types';
import { SrciCheckoutResponse } from './sdks/types';
import ShopperCard from '../models/ShopperCard';

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

function splitAvailableAndExpiredCards(memo: CardTypes, card: ShopperCard): CardTypes {
    if (card.isExpired) memo.expiredCards.push(card);
    else memo.availableCards.push(card);
    return memo;
}

/**
 * Creates the Shopper card list. The available cards are placed before the expired cards
 */
function createShopperCardsList(srcProfiles: SrcProfileWithScheme[]): ShopperCard[] {
    const { availableCards, expiredCards } = srcProfiles
        .reduce(createShopperMaskedCardsData, [])
        .reduce(splitAvailableAndExpiredCards, { availableCards: [], expiredCards: [] });

    return [...availableCards.sort(sortCardByLastTimeUsed), ...expiredCards.sort(sortCardByLastTimeUsed)];
}

export { createShopperCardsList, createCheckoutPayloadBasedOnScheme };
