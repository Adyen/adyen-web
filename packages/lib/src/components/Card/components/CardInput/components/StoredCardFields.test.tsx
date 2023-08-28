import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

import { CVC_POLICY_REQUIRED } from '../../../../internal/SecuredFields/lib/configuration/constants';
import StoredCardFields from './StoredCardFields';

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

describe('StoredCard', () => {
    test('Renders a StoredCard field, with readonly expiryDate and cvc field', () => {
        render(<StoredCardFields {...storedCardProps} />);

        // Look for expiryDate elements
        /* eslint-disable-next-line */
        expect(screen.queryByText('Expiry date', { exact: false })).toBeTruthy(); // presence

        expect(screen.getByLabelText('Expiry date', { exact: true })).toBeTruthy(); // presence
        expect(screen.getByLabelText('Expiry date', { exact: true })).toHaveAttribute('readonly', '');

        // Look for cvc field elements
        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is null); and with cvc field', () => {
        const newStoredCardProps = { ...storedCardProps };
        newStoredCardProps.expiryMonth = null;
        newStoredCardProps.expiryYear = null;

        render(<StoredCardFields {...newStoredCardProps} />);

        /* eslint-disable-next-line */
        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is empty string); and with cvc field', () => {
        const newStoredCardProps = { ...storedCardProps };
        newStoredCardProps.expiryMonth = '';
        newStoredCardProps.expiryYear = '';

        render(<StoredCardFields {...newStoredCardProps} />);

        /* eslint-disable-next-line */
        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });

    test('Renders a StoredCard field, without expiryDate (relevant data is missing); and with cvc field', () => {
        const newStoredCardProps = { ...storedCardProps };
        delete newStoredCardProps.expiryMonth;
        delete newStoredCardProps.expiryYear;

        render(<StoredCardFields {...newStoredCardProps} />);

        /* eslint-disable-next-line */
        expect(screen.queryByText('Expiry date', { exact: false })).toBeNull(); // non-presence

        expect(screen.getAllByText('Security code', { exact: true })).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Security code' })).toBeTruthy();
    });
});
