import AfterPayB2B from './AfterPayB2B';

describe('AfterPay B2B', () => {
    test('returns false if there is no state', () => {
        const afterPay = new AfterPayB2B({});
        expect(afterPay.isValid).toBe(false);
    });

    test('returns a type', () => {
        const afterPay = new AfterPayB2B({});
        expect(afterPay.data.paymentMethod.type).toBe('afterpay_b2b');
    });

    test('should show the company details as editable by default', () => {
        const afterPay = new AfterPayB2B({});
        expect(afterPay.props.visibility.companyDetails).toBe('editable');
    });
});
