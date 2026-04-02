import { createRef, h } from 'preact';
import { render, screen, act, fireEvent } from '@testing-library/preact';
import CardInput from './CardInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';

jest.mock('../../../internal/SecuredFields/lib/CSF');

let cardInputRef;

const cardInputRequiredProps = {
    i18n: global.i18n,
    clientKey: 'xxxx',
    loadingContext: 'test',
    resources: global.resources,
    brandsIcons: [],
    brandsConfiguration: {},
    showPayButton: false,
    onSubmitAnalytics: jest.fn(),
    setComponentRef: jest.fn(ref => {
        cardInputRef = ref;
    })
};

const selectableDualBrandResp = {
    issuingCountryCode: 'FR',
    supportedBrands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'VISA',
            paymentMethodVariant: 'visa',
            showSocialSecurityNumber: false,
            supported: true
        },
        {
            brand: 'cartebancaire',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'Carte Bancaire',
            paymentMethodVariant: 'cartebancaire',
            showSocialSecurityNumber: false,
            supported: true
        }
    ]
};

const displayOnlyDualBrandResp = {
    issuingCountryCode: 'AU',
    supportedBrands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'VISA',
            paymentMethodVariant: 'visa',
            showSocialSecurityNumber: false,
            supported: true
        },
        {
            brand: 'eftpos_australia',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'eftpos Australia',
            paymentMethodVariant: 'eftpos_australia',
            showSocialSecurityNumber: false,
            supported: true
        }
    ]
};

const renderCardInput = ui => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <AmountProvider amount={{ value: 10, currency: 'EUR' }} providerRef={createRef()}>
                {ui}
            </AmountProvider>
        </CoreProvider>
    );
};

describe('CardNumber and the dual branding UI', () => {
    test('should render without brand selection UI or contextual label when no dual branding', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('[data-cse="encryptedCardNumber"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedExpiryDate"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedSecurityCode"]')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */

        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });

    test('should show two selectable brand options with first selected by default and contextual label for selectable dual brand', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(selectableDualBrandResp, false);
        });

        // Two brand options with accessible names
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(screen.getByRole('button', { name: /visa/i })).toBeVisible();
        expect(screen.getByRole('button', { name: /cartebancaire/i })).toBeVisible();

        // First brand is selected by default
        expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');

        // Contextual label visible
        expect(screen.getByText(/the card brand/i)).toBeVisible();
    });

    test('should show display-only icons without selection UI or contextual label for non-selectable dual brand', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(displayOnlyDualBrandResp, false);
        });

        // Two brand images visible (display-only)
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(2);

        // No interactive selection UI
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.queryByRole('group')).not.toBeInTheDocument();

        // No contextual label
        expect(screen.queryByText(/the card brand/i)).not.toBeInTheDocument();
    });

    test('should not trigger validation when selecting a brand while PAN field is still active', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(selectableDualBrandResp, false);
        });

        // Brand selection and contextual text are visible
        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(screen.getByText(/the card brand/i)).toBeVisible();

        // First brand (visa) is selected by default
        const visaButton = screen.getByRole('button', { name: /visa/i });
        const cbButton = screen.getByRole('button', { name: /cartebancaire/i });
        expect(visaButton).toHaveAttribute('aria-pressed', 'true');
        expect(cbButton).toHaveAttribute('aria-pressed', 'false');

        // Click the second brand while PAN is incomplete (no blur has occurred)
        fireEvent.click(cbButton);

        // Brand selection UI must remain visible — no validation error triggered
        expect(screen.getAllByRole('button')).toHaveLength(2);

        // The chosen brand should now be selected
        expect(screen.getByRole('button', { name: /cartebancaire/i })).toHaveAttribute('aria-pressed', 'true');

        // Contextual text must remain visible
        expect(screen.getByText(/the card brand/i)).toBeVisible();

        // Switch back to first brand — still no validation
        fireEvent.click(screen.getByRole('button', { name: /visa/i }));

        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(screen.getByRole('button', { name: /visa/i })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText(/the card brand/i)).toBeVisible();
    });

    test('should hide brand selection UI and contextual label when PAN has validation error', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(selectableDualBrandResp, false);
        });

        // Brand selection is visible before error
        expect(screen.getAllByRole('button')).toHaveLength(2);

        await act(() => {
            cardInputRef.showValidation();
        });

        // Error state shown — at least one error element is visible
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.queryByText(/the card brand/i)).toHaveClass('adyen-checkout-contextual-text--hidden');
    });
});
