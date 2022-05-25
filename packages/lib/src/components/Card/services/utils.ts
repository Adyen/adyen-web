export type ShopperCard = {
    dateOfCardLastUsed: string;
    panLastFour: string;
    srcDigitalCardId: string;
    cardTitle: string;
    paymentCardDescriptor: string;
    srcCorrelationId: string;
};

function createShopperMaskedCardsData(memo: ShopperCard[], srcProfile: any): ShopperCard[] {
    const { profiles, srcCorrelationId } = srcProfile;

    const cards: ShopperCard[] = profiles.reduce((memo: ShopperCard[], profile: any) => {
        const profileCards: ShopperCard[] = profile.maskedCards.map((maskedCard: any) => ({
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

function createShopperCardsList(srcProfiles): ShopperCard[] {
    return srcProfiles.reduce(createShopperMaskedCardsData, []).sort(sortCardByLastTimeUsed);
}

export { createShopperCardsList };
