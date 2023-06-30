import Sepa from './Sepa';
// @ts-ignore ignore
import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { Resources } from '../../core/Context/Resources';
import SepaElement from './Sepa';
import Language from '../../language';

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
});

describe('SepaElement render', () => {
    test('should render IbanInput by default', async () => {
        render(<SepaElement i18n={new Language()} loadingContext="test" resources={new Resources()} />);
        expect(await screen.findByText('Holder Name')).toBeTruthy();
        expect(await screen.findByText('Account Number (IBAN)')).toBeTruthy();
    });

    test('should render FormInstruction by default', async () => {
        render(<SepaElement i18n={new Language()} loadingContext="test" resources={new Resources()} />);
        expect(await screen.findByText(/All fields are required unless marked otherwise./i)).toBeTruthy();
    });

    test('should not render FormInstruction if showFormInstruction sets to false', () => {
        render(<SepaElement FormInstruction={false} i18n={new Language()} loadingContext="test" resources={new Resources()} />);
        expect(screen.queryByText(/All fields are required unless marked otherwise./i)).toBeNull();
    });
});
