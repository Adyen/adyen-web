import QiwiWallet from './QiwiWallet';

describe('QiwiWallet', () => {
    describe('formatProps', () => {
        test("Always gets the right name for QiwiWallet's input", () => {
            const qiwi = new QiwiWallet({ core: global.core });
            expect(qiwi.props.phoneName).toBe('qiwiwallet.telephoneNumber');
            expect(qiwi.props.prefixName).toBe('qiwiwallet.telephoneNumberPrefix');
        });
    });

    describe('isValid', () => {
        test('returns false if there is no state', () => {
            const qiwiwallet = new QiwiWallet({ core: global.core });
            expect(qiwiwallet.isValid).toBe(false);
        });

        test('returns true if the state is valid', () => {
            const qiwiwallet = new QiwiWallet({ core: global.core });
            const data = {
                'qiwiwallet.telephoneNumberPrefix': '123',
                'qiwiwallet.telephoneNumber': '8000005141'
            };

            qiwiwallet.setState({ data, isValid: true });
            expect(qiwiwallet.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const qiwiwallet = new QiwiWallet({ core: global.core });
            expect(qiwiwallet.data.paymentMethod.type).toBe('qiwiwallet');
        });

        test('always returns the input data', () => {
            const qiwiwallet = new QiwiWallet({ core: global.core });
            const data = {
                phonePrefix: '123',
                phoneNumber: '8000005141'
            };

            qiwiwallet.setState({ data });
            expect(qiwiwallet.data.paymentMethod['qiwiwallet.telephoneNumber']).toBe('8000005141');
            expect(qiwiwallet.data.paymentMethod['qiwiwallet.telephoneNumberPrefix']).toBe('123');
        });
    });
});
