import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { buildEmiPlanPayload, classifyEmiPlansError, describeEmiPlansError } from './utils';
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

    test('should send every plan type in upper snake case', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).planType).toBe('NO_COST');
        expect(buildEmiPlanPayload(hdfc, hdfcStandard).planType).toBe('STANDARD');
        expect(buildEmiPlanPayload(icici, iciciLowCost).planType).toBe('LOW_COST');
    });

    test('should send a plan type it does not know in the same casing', () => {
        const unknown = { ...hdfcNoCost, type: 'zeroCost' } as unknown as EmiPlan;

        expect(buildEmiPlanPayload(hdfc, unknown).planType).toBe('ZERO_COST');
    });

    test('should echo the funding source of the issuer as the response spells it', () => {
        expect(buildEmiPlanPayload(hdfc, hdfcNoCost).fundingSource).toBe(hdfc.fundingSource);
        expect(buildEmiPlanPayload(emiDebitIssuerMock, emiDebitIssuerMock.plans[0]).fundingSource).toBe('debit');
    });

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

    test('should send the tenure and the rate as JSON numbers', () => {
        const payload = JSON.parse(JSON.stringify(buildEmiPlanPayload(hdfc, hdfcNoCost)));

        expect(typeof payload.tenureMonths).toBe('number');
        expect(typeof payload.interestRateBps).toBe('number');
    });

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

type ApiProblem = {
    type: string;
    title: string;
    status: number;
    errorCode: string;
    detail?: string;
    requestId?: string;
    invalidFields?: { name: string; value: string; message: string }[];
};

const apiError = (body: ApiProblem) => new AdyenCheckoutError('NETWORK_ERROR', 'Service is not available', { cause: body });

describe('classifyEmiPlansError', () => {
    test('should classify a token the backend cannot decode as an invalid token', () => {
        const error = apiError({
            type: 'https://docs.adyen.com/errors/unprocessable-entity',
            errorCode: '999_422_001',
            title: 'Missing or invalid input fields',
            detail: '',
            status: 422,
            invalidFields: [{ name: 'emiToken', value: '***REDACTED***', message: 'EMI token cannot be decoded.' }]
        });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_TOKEN_INVALID);
    });

    test('should classify a blank token the backend names as an invalid token', () => {
        const error = apiError({
            type: 'https://docs.adyen.com/errors/validation',
            errorCode: '29_001',
            title: 'The request is missing required fields or contains invalid data.',
            status: 422,
            invalidFields: [{ name: 'emiToken', value: 'null', message: 'must not be blank' }]
        });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_TOKEN_INVALID);
    });

    test('should classify a validation failure that names no field as a failed fetch', () => {
        const error = apiError({
            type: 'https://docs.adyen.com/errors/unprocessable-entity',
            errorCode: '999_422_000',
            title: 'Validation failure',
            detail: 'Input data validation failed',
            status: 422
        });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_FETCH_FAILED);
    });

    test('should classify a validation error about another field as a failed fetch', () => {
        const error = apiError({
            type: 'https://docs.adyen.com/errors/validation',
            errorCode: '29_001',
            title: 'The request is missing required fields or contains invalid data.',
            status: 422,
            invalidFields: [{ name: 'amount', value: 'null', message: 'must not be null' }]
        });

        expect(classifyEmiPlansError(error)).toBe(ErrorEventCode.EMI_PLANS_FETCH_FAILED);
    });

    test('should classify an API error that names no invalid field as a failed fetch', () => {
        const error = apiError({ type: 'https://docs.adyen.com/errors/forbidden', errorCode: '00_403', title: 'Forbidden', status: 403 });

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

describe('describeEmiPlansError', () => {
    test('should forward the title of the backend answer', () => {
        const error = apiError({
            type: 'https://docs.adyen.com/errors/unprocessable-entity',
            errorCode: '999_422_001',
            title: 'Missing or invalid input fields',
            detail: '',
            requestId: '2918b6b202e24fd91e0689b804e74ee4',
            status: 422,
            invalidFields: [{ name: 'emiToken', value: '***REDACTED***', message: 'EMI token cannot be decoded.' }]
        });

        expect(describeEmiPlansError(error)).toBe('EMI: Installment plans request failed: Missing or invalid input fields');
    });

    test('should forward neither the request id nor a field value, which can echo the token', () => {
        const error = apiError({
            type: 'https://docs.adyen.com/errors/bad-request',
            errorCode: '00_400',
            title: 'Bad request',
            requestId: '0dc47c14a735c3d66997fbaf0cbe031c',
            status: 400,
            invalidFields: [{ name: 'emiToken', value: 'Ab02b4c0!secret-token', message: 'Input value violates constraint value 1000' }]
        });

        expect(describeEmiPlansError(error)).toBe('EMI: Installment plans request failed: Bad request');
    });

    test('should send the fixed message when there is no backend answer', () => {
        expect(describeEmiPlansError(new AdyenCheckoutError('NETWORK_ERROR', 'Call failed', { cause: new TypeError('Failed to fetch') }))).toBe(
            'EMI: Installment plans request failed'
        );
        expect(describeEmiPlansError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'No clientKey'))).toBe('EMI: Installment plans request failed');
        expect(describeEmiPlansError(undefined)).toBe('EMI: Installment plans request failed');
    });
});
