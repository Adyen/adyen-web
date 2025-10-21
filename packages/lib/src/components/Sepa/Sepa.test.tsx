import Sepa from './Sepa';
import { render, screen } from '@testing-library/preact';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

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
            const sepa = mockStateChange(new Sepa(global.core, { loadingContext: 'test', modules: { resources: global.resources } }));
            expect(sepa.isValid).toBe(true);
        });

        test('Returns false if the state is not valid ', () => {
            const sepa = mockInvalidStateChange(new Sepa(global.core, { loadingContext: 'test', modules: { resources: global.resources } }));
            expect(sepa.isValid).toBe(false);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const sepa = mockStateChange(new Sepa(global.core, { loadingContext: 'test', modules: { resources: global.resources } }));
            expect(sepa.data.paymentMethod.type).toBe('sepadirectdebit');
        });

        test('returns necessary data from state', () => {
            const sepa = mockStateChange(new Sepa(global.core, { loadingContext: 'test', modules: { resources: global.resources } }));
            expect(sepa.data.paymentMethod.iban).toBe('NL13TEST0123456789');
            expect(sepa.data.paymentMethod.ownerName).toBe('A. Klaassen');
        });
    });
});

describe('render', () => {
    test('should render IbanInput by default', async () => {
        const core = setupCoreMock();
        const sepa = new Sepa(core, { i18n: global.i18n, loadingContext: 'test', modules: { resources: global.resources } });
        render(sepa.render());
        expect(await screen.findByText('Holder Name')).toBeTruthy();
        expect(await screen.findByText('Account Number (IBAN)')).toBeTruthy();
    });

    test('should render FormInstruction by default', async () => {
        const core = setupCoreMock();
        const sepa = new Sepa(core, { i18n: global.i18n, loadingContext: 'test', modules: { resources: global.resources } });
        render(sepa.render());
        expect(await screen.findByText(/All fields are required unless marked otherwise./i)).toBeTruthy();
    });
});
