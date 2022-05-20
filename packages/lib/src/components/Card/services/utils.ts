function createShopperMaskedCardsData(memo, srcProfile) {
    const { profiles, srcCorrelationId } = srcProfile;

    const cards = profiles.reduce((memo, profile) => {
        const profileCards = profile.maskedCards.map(maskedCard => ({
            dateOfCardLastUsed: maskedCard.dateOfCardLastUsed,
            panLastFour: maskedCard.panLastFour,
            srcDigitalCardId: maskedCard.srcDigitalCardId,
            cardTitle: maskedCard.digitalCardData.descriptorName,
            srcCorrelationId
        }));
        return [...memo, ...profileCards];
    }, []);

    return [...memo, ...cards];
}

function sortCardByLastTimeUsed(card1: any, card2: any) {
    return new Date(card2.dateOfCardLastUsed).getTime() - new Date(card1.dateOfCardLastUsed).getTime();
}

function createShopperCardsList(srcProfiles) {
    return srcProfiles.reduce(createShopperMaskedCardsData, []).sort(sortCardByLastTimeUsed);
}

export { createShopperCardsList };
