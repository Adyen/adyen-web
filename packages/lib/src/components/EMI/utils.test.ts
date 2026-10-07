import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { buildEmiPlanPayload, classifyEmiPlansError } from './utils';
import { emiDebitIssuerMock, emiPlansResponseMock } from './stories/mocks';
import type { EmiIssuer, EmiPlan } from './types';

describe('buildEmiPlanPayload', () => {
    const [hdfc, icici, axis, kotak] = emiPlansResponseMock.issuers;

    const [hdfcNoCost, hdfcStandard] = hdfc.plans;
    const [iciciLowCost, iciciStandard] = icici.plans;
    const [axisWithEmptyOffers] = axis.plans;
    const [kotakWithoutOffers] = kotak.plans;

    test('should build the payment request object of the selected plan', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost)).toEqual({
            tenureMonths: 3,
            issuerName: 'HDFC',
            fundingSource: 'credit',
            planType: 'NO_COST',
            interestRateBps: 1550,
            appliedOfferIds: ['offer-hdfc-cashback', 'offer-hdfc-nocost']
        });
    });

    /** `/payments` rejects the casing the lookup returns: `noCost` is answered with a 400. */
    test('should send every plan type in upper snake case', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).planType).toBe('NO_COST');
        expect(buildEmiPlanPayload(hdfc, hdfcStandard).planType).toBe('STANDARD');
        expect(buildEmiPlanPayload(icici, iciciLowCost).planType).toBe('LOW_COST');
    });

    /** A plan type the backend adds later has to reach `/payments` without an SDK release. */
    test('should send a plan type it does not know in the same casing', () => {
        const unknown = { ...hdfcNoCost, type: 'zeroCost' } as unknown as EmiPlan;

        expect(buildEmiPlanPayload(hdfc, unknown).planType).toBe('ZERO_COST');
    });

    /** Echoed rather than hardcoded, so the payload and the plan the shopper picked cannot drift. */
    test('should echo the funding source of the issuer as the response spells it', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).fundingSource).toBe(hdfc.fundingSource);
        expect(buildEmiPlanPayload(emiDebitIssuerMock, emiDebitIssuerMock.plans[0]).fundingSource).toBe('debit');
    });

    /**
     * `issuerName` is the only issuer field the payment request defines, and the backend matches its value
     * against the card BIN by string equality, so it carries the code rather than the row's display name.
     */
    test('should send the issuer code under issuerName, not the name the provider row displays', () => {
        const payload = buildEmiPlanPayload(hdfc, hdfcNoCost);

        expect(payload.issuerName).toBe(hdfc.issuerCode);
        expect(payload.issuerName).not.toBe(hdfc.issuerName);
        expect(payload).not.toHaveProperty('issuerCode');
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

    /** Every offer the plan lists was priced into it, so the SDK chooses none of them. */
    test('should apply every offer of a plan carrying several, in the order the response lists them', () => {
        expect(hdfcNoCost.offers).toHaveLength(2);
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).appliedOfferIds).toEqual(hdfcNoCost.offers?.map(offer => offer.offerId));
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
            'issuerName',
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
            expect(payload.issuerName).not.toHaveLength(0);
            expect(payload.tenureMonths).toBeGreaterThan(0);
            expect(payload.interestRateBps).toBeGreaterThan(0);
            expect(payload.fundingSource).toBe('credit');
            expect(['STANDARD', 'LOW_COST', 'NO_COST']).toContain(payload.planType);
        });
    });
});

describe('classifyEmiPlansError', () => {
    /** `http()` keeps the error body checkoutShopper answered with in `cause`. */
    const apiError = (body: { status: number; errorCode: string; errorType: string; message: string; invalidFields?: { name: string }[] }) =>
        new AdyenCheckoutError('NETWORK_ERROR', body.message, { cause: body });

    test('should classify a validation error naming the token in invalidFields as an invalid token', () => {
        const error = apiError({
            status: 422,
            errorCode: '14_030',
            errorType: 'validation',
            message: 'Invalid request',
            invalidFields: [{ name: 'emiToken' }]
        });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_TOKEN_INVALID);
    });

    test('should classify a validation error naming the token in its message as an invalid token', () => {
        const error = apiError({
            status: 422,
            errorCode: '14_030',
            errorType: 'validation',
            message: 'Field emiToken: EMI token cannot be decoded.'
        });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_TOKEN_INVALID);
    });

    test('should classify a validation error about another field as a failed fetch', () => {
        const error = apiError({
            status: 422,
            errorCode: '14_030',
            errorType: 'validation',
            message: 'Field amount is invalid',
            invalidFields: [{ name: 'amount' }]
        });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_FETCH_FAILED);
    });

    test('should classify an API error that is not a validation error as a failed fetch', () => {
        const error = apiError({ status: 500, errorCode: '905', errorType: 'internal', message: 'emiToken lookup failed' });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_FETCH_FAILED);
    });

    test('should classify an AdyenCheckoutError without an API error body, such as a timeout, as a failed fetch', () => {
        expect(classifyEmiPlansError(new AdyenCheckoutError('NETWORK_ERROR', 'Request timed out'))).toBe(ErrorEventCode.EMI_PLANS_FETCH_FAILED);
    });

    test('should classify an error that is not an AdyenCheckoutError as a failed fetch', () => {
        expect(classifyEmiPlansError(new TypeError('Failed to fetch'))).toBe(ErrorEventCode.EMI_PLANS_FETCH_FAILED);
        expect(classifyEmiPlansError(undefined)).toBe(ErrorEventCode.EMI_PLANS_FETCH_FAILED);
    });
});
