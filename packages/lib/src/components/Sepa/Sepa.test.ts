import Sepa from './Sepa';

describe('Sepa', () => {
    const mockStateChange = sepa => {
        sepa.setState({
            data: {
                ownerName: 'A. Klaassen',
                ibanNumber: 'NL13TEST0123456789'
            },
            isValid: true
        });
        return sepa;
    };

    const mockInvalidStateChange = sepa => {
        sepa.setState({
            data: {
                ownerName: 'A. Klaassen',
                ibanNumber: 'NOTANIBAN'
            },
            isValid: false
        });
        return sepa;
    };

    describe('isValid', () => {
        test('Returns true if the state isValid', () => {
            const sepa = mockStateChange(new Sepa({}));
            expect(sepa.isValid).toBe(true);
        });

        test('Returns false if the state is not valid ', () => {
            const sepa = mockInvalidStateChange(new Sepa({}));
            expect(sepa.isValid).toBe(false);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const sepa = mockStateChange(new Sepa({}));
            expect(sepa.data.paymentMethod.type).toBe('sepadirectdebit');
        });

        test('returns necessary data from state', () => {
            const sepa = mockStateChange(new Sepa({}));
            expect(sepa.data.paymentMethod.iban).toBe('NL13TEST0123456789');
            expect(sepa.data.paymentMethod.ownerName).toBe('A. Klaassen');
        });
    });

    // describe('render', () => {
    //     test('renders an IbanInput', () => {
    //         const sepa = mockStateChange(new Sepa({}));
    //         expect(sepa.render().nodeName.name).toBe('IbanInput');
    //     });
    // });
});
