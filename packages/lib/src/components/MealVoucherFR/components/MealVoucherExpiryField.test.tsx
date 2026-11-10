import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { MealVoucherExpiryField } from './MealVoucherExpiryField';
import { CoreProvider } from '../../../core/Context/CoreProvider';

const i18n = global.i18n;

const renderField = (sfpState = { errors: {}, valid: {}, data: {} }) => {
    return render(
        <CoreProvider i18n={i18n} loadingContext="test" resources={global.resources}>
            <MealVoucherExpiryField
                i18n={i18n}
                // @ts-ignore - only the properties consumed by this component are relevant for the test
                sfpState={sfpState}
                getCardErrorMessage={() => null}
                focusedElement={''}
                setFocusOn={() => {}}
            />
        </CoreProvider>
    );
};

describe('MealVoucherExpiryField', () => {
    test('should not render an error message when there is no error for the expiry date field', () => {
        renderField({ errors: {}, valid: {}, data: {} });
        expect(screen.queryByText(/enter/i)).not.toBeInTheDocument();
    });

    test('should render the translated error message when the expiry date field is in error', () => {
        renderField({ errors: { encryptedExpiryDate: 'cc.dat.912' }, valid: {}, data: {} });
        expect(screen.getByText('Enter a valid expiry date. Front of card in MM/YY format.')).toBeInTheDocument();
    });
});
