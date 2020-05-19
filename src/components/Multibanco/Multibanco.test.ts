import Multibanco from '.';

describe('Multibanco', () => {
    describe('formatProps', () => {
        test('has a default name', () => {
            const multibanco = new Multibanco({});
            expect(multibanco.props.name).toEqual('Multibanco');
        });

        test('can override the name', () => {
            const multibanco = new Multibanco({ name: 'Test' });
            expect(multibanco.props.name).toEqual('Test');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const multibanco = new Multibanco({});
            expect(multibanco.data).toMatchObject({ paymentMethod: { type: 'multibanco' } });
        });
    });

    describe('payButton', () => {
        const payButtonMock = jest.fn();

        beforeEach(() => {
            payButtonMock.mockReset();
        });

        test('can display a pay button', () => {
            const multibanco = new Multibanco({ i18n: { get: () => {}, loaded: Promise.resolve(true) } });
            multibanco.payButton = payButtonMock;
            multibanco.render();
            expect(payButtonMock.mock.calls).toHaveLength(1);
        });

        test('pay button can be disabled', () => {
            const multibanco = new Multibanco({ showPayButton: false, i18n: { get: () => {}, loaded: Promise.resolve(true) } });
            multibanco.payButton = payButtonMock;
            multibanco.render();
            expect(payButtonMock.mock.calls).toHaveLength(0);
        });
    });
});
