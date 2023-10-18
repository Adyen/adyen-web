import { MultibancoElement } from './Multibanco';

describe('Multibanco', () => {
    describe('formatProps', () => {
        test('has a default name', () => {
            const multibanco = new MultibancoElement({ core: global.core });
            expect(multibanco.props.name).toEqual('Multibanco');
        });

        test('can override the name', () => {
            const multibanco = new MultibancoElement({ core: global.core, name: 'Test' });
            expect(multibanco.props.name).toEqual('Test');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const multibanco = new MultibancoElement({ core: global.core });
            expect(multibanco.data).toMatchObject({ paymentMethod: { type: 'multibanco' } });
        });
    });
});
