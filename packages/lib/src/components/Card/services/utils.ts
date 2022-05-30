import { CheckoutPayload, ShopperCard } from './types';
import { SrciCheckoutResponse, SrcProfile } from './sdks/types';

function createCheckoutPayloadBasedOnScheme(card: ShopperCard, checkoutResponse: SrciCheckoutResponse): CheckoutPayload {
    switch (card.paymentCardDescriptor || 'visa') {
        case 'visa':
            return card.tokenId ? { scheme: 'visa', tokenId: card.tokenId } : { scheme: 'visa', checkoutPayload: checkoutResponse.encryptedPayload };
        case 'mastercard':
        default:
            return { digitalCardId: card.srcDigitalCardId, correlationId: card.srcCorrelationId, scheme: 'mc' };
    }
}

function createShopperMaskedCardsData(memo: ShopperCard[], srcProfile: SrcProfile): ShopperCard[] {
    const { profiles, srcCorrelationId } = srcProfile;

    const cards: ShopperCard[] = profiles.reduce((memo: ShopperCard[], profile) => {
        const profileCards: ShopperCard[] = profile.maskedCards.map(maskedCard => ({
            dateOfCardLastUsed: maskedCard.dateOfCardLastUsed,
            panLastFour: maskedCard.panLastFour,
            srcDigitalCardId: maskedCard.srcDigitalCardId,
            cardTitle: maskedCard.digitalCardData.descriptorName,
            paymentCardDescriptor: maskedCard.paymentCardDescriptor,
            tokenId: maskedCard.tokenId,
            srcCorrelationId
        }));
        return [...memo, ...profileCards];
    }, []);

    return [...memo, ...cards];
}

function sortCardByLastTimeUsed(card1: ShopperCard, card2: ShopperCard) {
    return new Date(card2.dateOfCardLastUsed).getTime() - new Date(card1.dateOfCardLastUsed).getTime();
}

function createShopperCardsList(srcProfiles: SrcProfile[]): ShopperCard[] {
    return srcProfiles.reduce(createShopperMaskedCardsData, []).sort(sortCardByLastTimeUsed);
}

export { createShopperCardsList, createCheckoutPayloadBasedOnScheme };
