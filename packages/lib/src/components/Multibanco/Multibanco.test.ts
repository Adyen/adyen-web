import { render, screen } from '@testing-library/preact';
import { MultibancoElement } from './Multibanco';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

describe('Multibanco', () => {
    describe('formatProps', () => {
        test('has a default name', () => {
            const multibanco = new MultibancoElement(core);
            expect(multibanco.props.name).toEqual('Multibanco');
        });

        test('can override the name', () => {
            const multibanco = new MultibancoElement(core, { name: 'Test' });
            expect(multibanco.props.name).toEqual('Test');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const multibanco = new MultibancoElement(core);
            expect(multibanco.data).toMatchObject({ paymentMethod: { type: 'multibanco' } });
        });
    });

    describe('render()', () => {
        test('should show the redirect button', () => {
            const multibanco = new MultibancoElement(core, {
                i18n: global.i18n
            });
            render(multibanco.render());

            expect(screen.getByRole('button', { name: 'Continue to Multibanco' })).toBeInTheDocument();
        });

        test('should not show the redirect button if showPayButton is false', () => {
            const multibanco = new MultibancoElement(core, {
                i18n: global.i18n,
                showPayButton: false
            });
            render(multibanco.render());

            expect(screen.queryByRole('button', { name: 'Continue to Multibanco' })).not.toBeInTheDocument();
        });

        test('should show reference when available', () => {
            const multibanco = new MultibancoElement(core, {
                i18n: global.i18n,
                modules: { resources: global.resources },
                reference: '123456789'
            });
            render(multibanco.render());

            expect(screen.getByText('123456789')).toBeInTheDocument();
        });
    });
});
