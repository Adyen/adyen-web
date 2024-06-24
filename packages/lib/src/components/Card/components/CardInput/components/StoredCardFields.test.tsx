import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

import { CVC_POLICY_REQUIRED } from '../../../../internal/SecuredFields/lib/constants';
import StoredCardFields from './StoredCardFields';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';

const storedCardProps = {
    brand: 'visa',
    expiryMonth: '03',
    expiryYear: '2030',
    lastFour: '1111',
    hasCVC: true,
    onFocusField: () => {},
    errors: {},
    valid: {},
    cvcPolicy: CVC_POLICY_REQUIRED,
    focusedElement: ''
};

const renderWithCoreProvider = ui => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );
};

describe('StoredCard', () => {
    test('Renders a StoredCard field, with readonly expiryDate and cvc field', () => {
        renderWithCoreProvider(<StoredCardFields {...storedCardProps} />);

        // Look for expiryDate elements
         
        expect(screen.queryByText('Expiry date', { exact: false })).toBeTruthy(); // presence

        expect(screen.getByLabelText('Expiry date', { exact: true })).toBeTruthy(); // presence

        // Look for cvc field elements
        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is null); and with cvc field', () => {
        const newStoredCardProps = { ...storedCardProps };
        newStoredCardProps.expiryMonth = null;
        newStoredCardProps.expiryYear = null;

        renderWithCoreProvider(<StoredCardFields {...newStoredCardProps} />);

         
        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is empty string); and with cvc field', () => {
        const newStoredCardProps = { ...storedCardProps };
        newStoredCardProps.expiryMonth = '';
        newStoredCardProps.expiryYear = '';

        renderWithCoreProvider(<StoredCardFields {...newStoredCardProps} />);

         
        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is missing); and with cvc field', () => {
        const newStoredCardProps = { ...storedCardProps };
        delete newStoredCardProps.expiryMonth;
        delete newStoredCardProps.expiryYear;

        renderWithCoreProvider(<StoredCardFields {...newStoredCardProps} />);

         
        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });
});
