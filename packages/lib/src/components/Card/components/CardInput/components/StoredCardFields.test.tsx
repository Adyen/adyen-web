import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

import { CVC_POLICY_REQUIRED } from '../../../../internal/SecuredFields/lib/constants';
import StoredCardFields from './StoredCardFields';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import type { StoredCardFieldsProps } from './types';

const storedCardPropsWithoutExpiry: StoredCardFieldsProps = {
    brand: 'visa',
    lastFour: '1111',
    hasCVC: true,
    onFocusField: () => {},
    errors: {},
    valid: {},
    cvcPolicy: CVC_POLICY_REQUIRED,
    focusedElement: ''
};

const storedCardProps: StoredCardFieldsProps = {
    ...storedCardPropsWithoutExpiry,
    expiryMonth: '03',
    expiryYear: '2030'
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
        expect(screen.getByText('Expiry date', { exact: false })).toBeTruthy(); // presence
        expect(screen.getByLabelText('Expiry date', { exact: true })).toBeTruthy(); // presence

        // Look for cvc field elements
        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByTestId('cvc-hint-back')).toBeInTheDocument();
        expect(screen.getByTestId('cvc-hint-back')).toHaveAttribute('aria-hidden', 'true');
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is null); and with cvc field', () => {
        const newStoredCardProps: StoredCardFieldsProps = { ...storedCardProps, expiryMonth: null, expiryYear: null };

        renderWithCoreProvider(<StoredCardFields {...newStoredCardProps} />);

        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByTestId('cvc-hint-back')).toBeInTheDocument();
        expect(screen.getByTestId('cvc-hint-back')).toHaveAttribute('aria-hidden', 'true');
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is empty string); and with cvc field', () => {
        const newStoredCardProps: StoredCardFieldsProps = { ...storedCardProps, expiryMonth: '', expiryYear: '' };

        renderWithCoreProvider(<StoredCardFields {...newStoredCardProps} />);

        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByTestId('cvc-hint-back')).toBeInTheDocument();
        expect(screen.getByTestId('cvc-hint-back')).toHaveAttribute('aria-hidden', 'true');
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is missing); and with cvc field', () => {
        renderWithCoreProvider(<StoredCardFields {...storedCardPropsWithoutExpiry} />);

        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByTestId('cvc-hint-back')).toBeInTheDocument();
        expect(screen.getByTestId('cvc-hint-back')).toHaveAttribute('aria-hidden', 'true');
    });
});
