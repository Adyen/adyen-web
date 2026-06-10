import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import Affirm from './Affirm';
import type { ICore } from '../../types';

describe('Affirm', () => {
    let core: ICore;

    beforeEach(() => {
        core = setupCoreMock();
    });

    test('returns false if there is no state', () => {
        const affirm = new Affirm(core);
        expect(affirm.isValid).toBe(false);
    });

    test('returns a type', () => {
        const affirm = new Affirm(core);
        expect(affirm.data.paymentMethod.type).toBe('affirm');
    });

    test('uses countryCode as-is when it is in allowedCountries', () => {
        const affirm = new Affirm(core, { countryCode: 'US', allowedCountries: ['US', 'GB'] });
        expect(affirm.props.countryCode).toBe('US');
        expect(affirm.props.allowedCountries).toEqual(['US', 'GB']);
    });

    test('defaults to the first allowed country when countryCode is not in allowedCountries', () => {
        const affirm = new Affirm(core, { countryCode: 'US', allowedCountries: ['GB'] });
        expect(affirm.props.countryCode).toBe('GB');
    });

    test('defaults allowedCountries to CA and US when not provided', () => {
        const affirm = new Affirm(core, { countryCode: 'US' });
        expect(affirm.props.allowedCountries).toEqual(['CA', 'US']);
    });

    test('filters out unsupported countries from allowedCountries', () => {
        const affirm = new Affirm(core, { allowedCountries: ['US', 'FR'] });
        expect(affirm.props.allowedCountries).toEqual(['US']);
    });
});
