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
});
