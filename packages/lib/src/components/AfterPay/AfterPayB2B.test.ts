import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { ICore } from '../../types';
import AfterPayB2B from './AfterPayB2B';

describe('AfterPay B2B', () => {
    let core: ICore;

    beforeEach(() => {
        core = setupCoreMock();
    });

    test('returns false if there is no state', () => {
        const afterPay = new AfterPayB2B(core);
        expect(afterPay.isValid).toBe(false);
    });

    test('returns a type', () => {
        const afterPay = new AfterPayB2B(core);
        expect(afterPay.data.paymentMethod.type).toBe('afterpay_b2b');
    });

    test('should show the company details as editable by default', () => {
        const afterPay = new AfterPayB2B(core);
        expect(afterPay.props.visibility.companyDetails).toBe('editable');
    });
});
