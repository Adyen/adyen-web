import { SrcCard } from '../services/sdks/types';
import { ClickToPayScheme } from '../../../types';
import { SchemeNames } from '../services/sdks/utils';

class ShopperCard {
    public dateOfCardLastUsed: string;
    public panLastFour: string;
    public srcDigitalCardId: string;
    public scheme: ClickToPayScheme;
    public artUri: string;
    public srcCorrelationId: string;
    public tokenId?: string;

    private descriptorName?: string;

    constructor(maskedCard: SrcCard, scheme: ClickToPayScheme, srcCorrelationId: string) {
        this.dateOfCardLastUsed = maskedCard.dateOfCardLastUsed;
        this.panLastFour = maskedCard.panLastFour;
        this.srcDigitalCardId = maskedCard.srcDigitalCardId;
        this.descriptorName = maskedCard.digitalCardData.descriptorName;
        this.tokenId = maskedCard.tokenId;
        this.scheme = scheme;
        this.artUri = maskedCard.digitalCardData.artUri;
        this.srcCorrelationId = srcCorrelationId;
    }

    get title() {
        return this.descriptorName || SchemeNames[this.scheme];
    }
}

export default ShopperCard;
