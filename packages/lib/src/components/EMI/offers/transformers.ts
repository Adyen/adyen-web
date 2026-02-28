import type { SelectItem } from '../../internal/FormFields/Select/types';
import type { EMIOffer, EMIPaymentMethodData, EMIDetailItem } from './types';

// TODO: Interest rate should come from backend contract. Currently not provided in paymentMethods response.
const DEFAULT_INTEREST_RATE = 16;

export function transformOffersToProviders(offers: EMIOffer[]): SelectItem[] {
    const uniqueBanks = new Map<string, EMIOffer>();

    offers.forEach(offer => {
        if (offer.bank && !uniqueBanks.has(offer.bank)) {
            uniqueBanks.set(offer.bank, offer);
        }
    });

    return Array.from(uniqueBanks.entries()).map(([bank, offer]) => ({
        id: bank.toLowerCase(),
        name: `${bank} Credit Cards`
    }));
}

export function transformOffersToDiscounts(offers: EMIOffer[], providerId?: string): SelectItem[] {
    return offers
        .filter(offer => offer.type === 'instantDiscount' || offer.type === 'cashback' || offer.type === 'noCostEmi')
        .filter(offer => !providerId || !offer.bank || offer.bank.toLowerCase() === providerId)
        .map(offer => ({
            id: offer.id,
            name: offer.tag
        }));
}

export function filterOffersByProvider(offers: EMIOffer[], providerId: string): EMIOffer[] {
    if (!providerId) return offers;
    return offers.filter(offer => !offer.bank || offer.bank.toLowerCase() === providerId);
}

function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return emi;
}

function formatAmount(value: number, currency: string): string {
    return `${currency} ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function transformDetailItemsToPlans(
    detailItems: EMIDetailItem[],
    amount: number,
    currency: string,
    cardBrand?: string
): SelectItem[] {
    const plans: SelectItem[] = [];

    detailItems.forEach(item => {
        if (item.configuration?.installmentOptions) {
            Object.entries(item.configuration.installmentOptions)
                .filter(([brand]) => !cardBrand || brand === cardBrand)
                .forEach(([brand, options]) => {
                    const tenures = options.plans?.map(p => p.tenure) ?? options.values ?? [];

                    tenures.forEach(tenure => {
                        const interestRate = options.plans?.find(p => p.tenure === tenure)?.interestRate ?? DEFAULT_INTEREST_RATE;
                        const emi = calculateEMI(amount, interestRate, tenure);
                        const totalAmount = emi * tenure;
                        const interestAmount = totalAmount - amount;

                        plans.push({
                            id: `${item.id}_${brand}_${tenure}`,
                            name: `${formatAmount(emi, currency)} x ${tenure} months`,
                            secondaryText: `Total of ${formatAmount(totalAmount, currency)} (interest ${formatAmount(interestAmount, currency)} @ ${interestRate}% p.a)`
                        });
                    });
                });
        }
    });

    return plans;
}

export function transformEMIDataToSelectItems(
    emiData: EMIPaymentMethodData,
    amount: number = 100000,
    currency: string = 'INR',
    cardBrand?: string
): {
    providers: SelectItem[];
    discounts: SelectItem[];
    plans: SelectItem[];
    rawOffers: EMIOffer[];
    rawDetails: EMIDetailItem[];
} {
    const providers = transformOffersToProviders(emiData.offers);
    const discounts = transformOffersToDiscounts(emiData.offers);

    const emiTypeDetail = emiData.details.find(d => d.key === 'emiType');
    const plans = emiTypeDetail ? transformDetailItemsToPlans(emiTypeDetail.items, amount, currency, cardBrand) : [];

    return {
        providers,
        discounts,
        plans,
        rawOffers: emiData.offers,
        rawDetails: emiTypeDetail?.items ?? []
    };
}
