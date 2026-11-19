import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { MealVoucherExpiryField } from './MealVoucherExpiryField';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';
import type { SFPState } from '../../internal/SecuredFields/SFP/types';

const { i18n, resources } = setupCoreMock().modules;

const renderField = (sfpState: SFPState = { errors: {}, valid: {}, data: {}, isSfpValid: false }) => {
    return render(
        <CoreProvider i18n={i18n} loadingContext="test" resources={resources}>
            <MealVoucherExpiryField i18n={i18n} sfpState={sfpState} getCardErrorMessage={() => null} focusedElement={''} setFocusOn={() => {}} />
        </CoreProvider>
    );
};

describe('MealVoucherExpiryField', () => {
    test('should not render an error message when there is no error for the expiry date field', () => {
        renderField({ errors: {}, valid: {}, data: {}, isSfpValid: false });
        expect(screen.queryByText(/enter/i)).not.toBeInTheDocument();
    });

    test('should render the translated error message when the expiry date field is in error', () => {
        renderField({ errors: { encryptedExpiryDate: 'cc.dat.912' }, valid: {}, data: {}, isSfpValid: false });
        expect(screen.getByText('Enter a valid expiry date. Front of card in MM/YY format.')).toBeInTheDocument();
    });
});
