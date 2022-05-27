import { ShopperCard } from './types';
import { SrcProfile } from './sdks/types';

function createShopperMaskedCardsData(memo: ShopperCard[], srcProfile: SrcProfile): ShopperCard[] {
    const { profiles, srcCorrelationId } = srcProfile;

    const cards: ShopperCard[] = profiles.reduce((memo: ShopperCard[], profile) => {
        const profileCards: ShopperCard[] = profile.maskedCards.map(maskedCard => ({
            dateOfCardLastUsed: maskedCard.dateOfCardLastUsed,
            panLastFour: maskedCard.panLastFour,
            srcDigitalCardId: maskedCard.srcDigitalCardId,
            cardTitle: maskedCard.digitalCardData.descriptorName,
            paymentCardDescriptor: maskedCard.paymentCardDescriptor,
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

export { createShopperCardsList };
