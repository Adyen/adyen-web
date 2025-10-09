import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import ExpirationDate from './ExpirationDate';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import { DATE_POLICY_REQUIRED } from '../../../../internal/SecuredFields/lib/constants';

const renderWithCoreContext = ui => {
    return render(
        <CoreProvider i18n={global.i18n} resources={global.resources} loadingContext="test">
            {ui}
        </CoreProvider>
    );
};

describe('ExpirationDate', () => {
    const defaultProps = {
        label: 'Expiry date',
        onFocusField: jest.fn(),
        expiryDatePolicy: DATE_POLICY_REQUIRED,
        focused: false,
        filled: false,
        error: '',
        isValid: false,
        showContextualElement: false,
        contextualText: 'MM/YY'
    };

    test('should apply classNameModifiers to the Field component', () => {
        const modifiers = ['custom-modifier-1', 'custom-modifier-2'];
        renderWithCoreContext(<ExpirationDate {...defaultProps} classNameModifiers={modifiers} />);

        const fieldElement = screen.getByTestId('form-field');
        expect(fieldElement).toHaveClass('adyen-checkout__field--custom-modifier-1', 'adyen-checkout__field--custom-modifier-2');
        expect(fieldElement).toHaveClass('adyen-checkout__field--expiryDate');
    });
});
