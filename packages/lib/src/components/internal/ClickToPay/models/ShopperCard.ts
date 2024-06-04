import { DigitalCardStatus, SrcCard } from '../services/sdks/types';
import { SchemeNames } from '../services/sdks/utils';
import { ClickToPayScheme } from '../types';

class ShopperCard {
    public dateOfCardLastUsed?: string;
    public dateOfCardCreated: string;
    public panLastFour: string;
    public srcDigitalCardId: string;
    public scheme: ClickToPayScheme;
    public artUri: string;
    public srcCorrelationId: string;
    public tokenId?: string;
    public isExpired: boolean;

    private readonly panExpirationMonth: string;
    private readonly panExpirationYear: string;
    private readonly descriptorName?: string;
    private readonly status?: DigitalCardStatus = null;

    constructor(maskedCard: SrcCard, scheme: ClickToPayScheme, srcCorrelationId: string) {
        this.dateOfCardLastUsed = maskedCard.dateOfCardLastUsed;
        this.dateOfCardCreated = maskedCard.dateOfCardCreated;
        this.panLastFour = maskedCard.panLastFour;
        this.srcDigitalCardId = maskedCard.srcDigitalCardId;
        this.descriptorName = maskedCard.digitalCardData.descriptorName;
        this.tokenId = maskedCard.tokenId;
        this.scheme = scheme;
        this.artUri = maskedCard.digitalCardData.artUri;
        this.srcCorrelationId = srcCorrelationId;
        this.panExpirationMonth = maskedCard.panExpirationMonth;
        this.panExpirationYear = maskedCard.panExpirationYear;
        this.status = maskedCard.digitalCardData.status;

        this.isExpired = this.confirmCardIsExpired();
    }

    get title() {
        return this.scheme === 'visa' ? SchemeNames[this.scheme] : this.descriptorName || SchemeNames[this.scheme];
    }

    get isDcfPopupEmbedded(): boolean {
        return this.scheme === 'mc';
    }

    private confirmCardIsExpired(): boolean {
        if (this.status !== 'ACTIVE') return true;
        if (!this.panExpirationYear && !this.panExpirationMonth) return false;

        const [currentMonth, currentYear] = [new Date().getMonth() + 1, new Date().getFullYear()];
        if (Number(this.panExpirationYear) > currentYear) return false;
        if (Number(this.panExpirationYear) === currentYear && Number(this.panExpirationMonth) >= currentMonth) return false;

        return true;
    }
}

export default ShopperCard;
