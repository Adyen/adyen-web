import Pix from './Pix';

describe('Pix', () => {
    describe('get data', () => {
        test('always returns a type', () => {
            const pix = new Pix({});
            expect(pix.data.paymentMethod.type).toBe('pix');
        });
    });

    describe('optional props', () => {
        test('always returns  a type', () => {
            const pix = new Pix({});
            expect(pix.props.personalDetailsRequired).toBe(false);
        });

        test('always returns a type', () => {
            const pix = new Pix({ personalDetailsRequired: true });
            expect(pix.props.personalDetailsRequired).toBe(true);
        });
    });
});
