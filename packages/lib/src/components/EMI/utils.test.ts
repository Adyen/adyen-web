import { buildEmiPlanPayload, resolvePlanIssuers, selectDisplayOffer } from './utils';
import { emiPlansEmptyResponseMock, emiPlansResponseMock } from './stories/mocks';
import type { EmiIssuer, EmiOffer, EmiPlan, EmiPlansResponse } from './types';

/** Merchants hand the response over untyped, so these shapes reach the SDK at runtime. */
const asResponse = (plans: unknown): EmiPlansResponse => plans as EmiPlansResponse;

describe('resolvePlanIssuers', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    test('should return the issuers of a valid response', () => {
        expect(resolvePlanIssuers(emiPlansResponseMock)).toEqual(emiPlansResponseMock.issuers);
        expect(warn).not.toHaveBeenCalled();
    });

    test('should return the very same objects, not copies of them', () => {
        expect(resolvePlanIssuers(emiPlansResponseMock)[0]).toBe(emiPlansResponseMock.issuers[0]);
    });

    test('should keep the backend order of the issuers and of their plans', () => {
        const issuers = resolvePlanIssuers(emiPlansResponseMock);

        expect(issuers.map(issuer => issuer.issuerCode)).toEqual(['HDFC', 'ICICI', 'AXIS', 'KOTAK']);
        expect(issuers[0].plans.map(plan => plan.tenureMonths)).toEqual([3, 6]);
    });

    test('should return no issuer for a response holding none', () => {
        expect(resolvePlanIssuers(emiPlansEmptyResponseMock)).toEqual([]);
        expect(warn).not.toHaveBeenCalled();
    });

    test('should stay quiet when no plans are configured at all', () => {
        expect(resolvePlanIssuers(undefined)).toEqual([]);
        expect(warn).not.toHaveBeenCalled();
    });

    test('should throw on a response that was never parsed', () => {
        expect(() => resolvePlanIssuers(asResponse(JSON.stringify(emiPlansResponseMock)))).toThrow(/a string was provided/);
    });

    test('should throw when only part of the response was passed', () => {
        expect(() => resolvePlanIssuers(asResponse(emiPlansResponseMock.issuers))).toThrow(/an array was provided/);
    });

    test('should name the misconfiguration as an implementation error', () => {
        expect(() => resolvePlanIssuers(asResponse('{}'))).toThrow(expect.objectContaining({ name: 'IMPLEMENTATION_ERROR' }));
    });

    test('should warn and offer no issuer when the response carries no issuers array', () => {
        expect(resolvePlanIssuers(asResponse({}))).toEqual([]);
        expect(resolvePlanIssuers(asResponse({ issuers: 'HDFC' }))).toEqual([]);

        expect(warn).toHaveBeenCalledTimes(2);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('no `issuers` array'));
    });
});

describe('selectDisplayOffer', () => {
    const offer = (offerId: string, value: number): EmiOffer => ({ offerId, amount: { value, currency: 'INR' } });

    test('should show the largest discount', () => {
        expect(selectDisplayOffer([offer('small', 100000), offer('largest', 400000), offer('medium', 250000)])).toEqual(offer('largest', 400000));
    });

    test('should keep the first of two offers tied on amount', () => {
        expect(selectDisplayOffer([offer('first', 400000), offer('second', 400000)])).toEqual(offer('first', 400000));
    });

    test('should show the only offer there is', () => {
        expect(selectDisplayOffer([offer('only', 100000)])).toEqual(offer('only', 100000));
    });

    test('should show nothing when the plan carries no offer', () => {
        expect(selectDisplayOffer([])).toBeUndefined();
    });

    test('should show nothing when the plan carries no offers field at all', () => {
        expect(selectDisplayOffer()).toBeUndefined();
    });
});

describe('buildEmiPlanPayload', () => {
    const [hdfc, icici, axis, kotak] = emiPlansResponseMock.issuers;

    const [hdfcNoCost, hdfcStandard] = hdfc.plans;
    const [iciciLowCost, iciciStandard] = icici.plans;
    const [axisWithEmptyOffers] = axis.plans;
    const [kotakWithoutOffers] = kotak.plans;

    test('should build the payment request object of the selected plan', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost)).toEqual({
            tenureMonths: 3,
            issuerCode: 'HDFC',
            fundingSource: 'credit',
            planType: 'noCost',
            interestRateBps: 1550,
            appliedOfferIds: ['offer-hdfc-nocost']
        });
    });

    test('should echo every plan type as the response spells it', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).planType).toBe(hdfcNoCost.type);
        expect(buildEmiPlanPayload(hdfc, hdfcStandard).planType).toBe(hdfcStandard.type);
        expect(buildEmiPlanPayload(icici, iciciLowCost).planType).toBe(iciciLowCost.type);
    });

    test('should echo both funding sources as the response spells them', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).fundingSource).toBe(hdfc.fundingSource);
        expect(buildEmiPlanPayload(axis, axisWithEmptyOffers).fundingSource).toBe(axis.fundingSource);
    });

    /** The backend matches this against the card BIN by string equality, so the display name would fail. */
    test('should send the issuer code, not the name the provider row displays', () => {
        const { issuerCode } = buildEmiPlanPayload(hdfc, hdfcNoCost);

        expect(issuerCode).toBe(hdfc.issuerCode);
        expect(issuerCode).not.toBe(hdfc.issuerName);
    });

    test('should echo the tenure and the rate of the selected plan', () => {
        expect(buildEmiPlanPayload(icici, iciciStandard)).toEqual(
            expect.objectContaining({ tenureMonths: iciciStandard.tenureMonths, interestRateBps: iciciStandard.interestRateBps })
        );
    });

    /** `tenureMonths` and `interestRateBps` are integers on the wire, and the backend rejects strings. */
    test('should send the tenure and the rate as JSON numbers', () => {
        const payload = JSON.parse(JSON.stringify(buildEmiPlanPayload(hdfc, hdfcNoCost)));

        expect(typeof payload.tenureMonths).toBe('number');
        expect(typeof payload.interestRateBps).toBe('number');
    });

    test('should apply the largest offer of the plan, the one the shopper was shown', () => {
        const shownOffer = selectDisplayOffer(hdfcNoCost.offers);

        expect(shownOffer?.amount.value).toBe(400000);
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).appliedOfferIds).toEqual([shownOffer?.offerId]);
    });

    test('should apply a single offer even when the plan carries several', () => {
        expect(hdfcNoCost.offers).toHaveLength(2);
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).appliedOfferIds).toHaveLength(1);
    });

    test('should apply the only offer of a plan carrying one', () => {
        expect(buildEmiPlanPayload(icici, iciciLowCost).appliedOfferIds).toEqual(['offer-icici-lowcost']);
    });

    test('should omit the offer ids, rather than send an empty list, for a plan with an empty offers array', () => {
        const payload = buildEmiPlanPayload(axis, axisWithEmptyOffers);

        expect(axisWithEmptyOffers.offers).toEqual([]);
        expect(payload).not.toHaveProperty('appliedOfferIds');
        expect(JSON.stringify(payload)).not.toContain('appliedOfferIds');
    });

    test('should omit the offer ids for a plan carrying no offers field at all', () => {
        expect(buildEmiPlanPayload(kotak, kotakWithoutOffers)).not.toHaveProperty('appliedOfferIds');
    });

    test('should carry nothing beyond the fields the payment request defines', () => {
        expect(Object.keys(buildEmiPlanPayload(hdfc, hdfcNoCost)).sort()).toEqual([
            'appliedOfferIds',
            'fundingSource',
            'interestRateBps',
            'issuerCode',
            'planType',
            'tenureMonths'
        ]);
    });

    /** Every plan of every issuer the lookup can return has to produce a payload the backend accepts. */
    test('should build a complete payload for every plan of the fixture', () => {
        const payloads = emiPlansResponseMock.issuers.flatMap((issuer: EmiIssuer) =>
            issuer.plans.map((plan: EmiPlan) => buildEmiPlanPayload(issuer, plan))
        );

        payloads.forEach(payload => {
            expect(payload.issuerCode).not.toHaveLength(0);
            expect(payload.tenureMonths).toBeGreaterThan(0);
            expect(payload.interestRateBps).toBeGreaterThan(0);
            expect(['credit', 'debit']).toContain(payload.fundingSource);
            expect(['standard', 'lowCost', 'noCost']).toContain(payload.planType);
        });
    });
});
