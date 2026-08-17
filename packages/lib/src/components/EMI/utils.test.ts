import { getDefaultSelection, getSelectableIssuers, resolveSelection } from './utils';
import { emiIssuersFixture } from './emi-plans.fixture';
import type { EmiIssuerOption } from './types';

const [hdfc, icici, axis, kotak] = emiIssuersFixture;
const issuerWithoutPlans: EmiIssuerOption = { id: 'sbi', name: 'State Bank of India', fundingSource: 'credit', plans: [] };

describe('getSelectableIssuers', () => {
    test('should drop issuers that carry no plans', () => {
        expect(getSelectableIssuers([issuerWithoutPlans, hdfc])).toEqual([hdfc]);
    });

    test('should keep the order of the remaining issuers', () => {
        expect(getSelectableIssuers(emiIssuersFixture)).toEqual([hdfc, icici, axis, kotak]);
    });
});

describe('getDefaultSelection', () => {
    test('should select the first issuer and its first plan', () => {
        expect(getDefaultSelection(emiIssuersFixture)).toEqual({ issuer: hdfc, plan: hdfc.plans[0] });
    });

    test('should skip a leading issuer that has no plans', () => {
        expect(getDefaultSelection([issuerWithoutPlans, icici])).toEqual({ issuer: icici, plan: icici.plans[0] });
    });

    test('should return null when nothing can be selected', () => {
        expect(getDefaultSelection([])).toBeNull();
        expect(getDefaultSelection([issuerWithoutPlans])).toBeNull();
    });
});

describe('resolveSelection', () => {
    test('should return the very same selection when the list still holds it', () => {
        const current = { issuer: icici, plan: icici.plans[1] };

        expect(resolveSelection(emiIssuersFixture, current)).toBe(current);
    });

    test('should keep the selection across a re-created list carrying the same ids', () => {
        const current = { issuer: icici, plan: icici.plans[1] };
        const recreated = emiIssuersFixture.map(issuer => ({ ...issuer, plans: issuer.plans.map(plan => ({ ...plan })) }));

        const resolved = resolveSelection(recreated, current);

        expect(resolved).not.toBe(current);
        expect(resolved).toEqual(current);
    });

    test('should fall back to the default when the selected issuer is gone', () => {
        const current = { issuer: icici, plan: icici.plans[0] };

        expect(resolveSelection([hdfc], current)).toEqual({ issuer: hdfc, plan: hdfc.plans[0] });
    });

    test('should fall back to the default when the selected plan is gone', () => {
        const current = { issuer: hdfc, plan: hdfc.plans[1] };
        const hdfcWithOnePlan = { ...hdfc, plans: [hdfc.plans[0]] };

        expect(resolveSelection([hdfcWithOnePlan], current)).toEqual({ issuer: hdfcWithOnePlan, plan: hdfc.plans[0] });
    });

    test('should return the default when there is no selection yet', () => {
        expect(resolveSelection(emiIssuersFixture, null)).toEqual({ issuer: hdfc, plan: hdfc.plans[0] });
    });

    test('should return null when the list becomes empty', () => {
        expect(resolveSelection([], { issuer: hdfc, plan: hdfc.plans[0] })).toBeNull();
    });
});
