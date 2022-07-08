import { ClickToPayCheckoutPayload, SrcProfileWithScheme } from './types';
import { SrciCheckoutResponse } from './sdks/types';
import ShopperCard from '../models/ShopperCard';

function createCheckoutPayloadBasedOnScheme(card: ShopperCard, checkoutResponse: SrciCheckoutResponse): ClickToPayCheckoutPayload {
    const { scheme, tokenId, srcDigitalCardId, srcCorrelationId } = card;

    switch (scheme) {
        case 'visa':
            return tokenId ? { scheme, tokenId } : { scheme, checkoutPayload: checkoutResponse.encryptedPayload };
        case 'mc':
        default:
            return { scheme, digitalCardId: srcDigitalCardId, correlationId: srcCorrelationId };
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

function createShopperCardsList(srcProfiles: SrcProfileWithScheme[]): ShopperCard[] {
    return srcProfiles.reduce(createShopperMaskedCardsData, []).sort(sortCardByLastTimeUsed);
}

export { createShopperCardsList, createCheckoutPayloadBasedOnScheme };
