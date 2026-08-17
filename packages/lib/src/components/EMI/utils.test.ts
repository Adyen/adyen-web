import { resolvePlanIssuers, selectDisplayOffer } from './utils';
import { emiPlansEmptyResponseMock, emiPlansResponseMock } from './stories/mocks';
import type { EmiOffer, EmiPlansResponse } from './types';

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
