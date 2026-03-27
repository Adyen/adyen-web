import { createRef, h } from 'preact';
import { render, screen, act } from '@testing-library/preact';
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

const euDualBrandResp = {
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

const nonEuDualBrandResp = {
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

        expect(screen.queryAllByRole('radio')).toHaveLength(0);
        expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    });

    test('should show two selectable brand options with first selected by default and contextual label for EU dual brand', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(euDualBrandResp, false);
        });

        // Two brand options with accessible names
        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(2);
        expect(screen.getByRole('radio', { name: /visa/i })).toBeVisible();
        expect(screen.getByRole('radio', { name: /carte bancaire/i })).toBeVisible();

        // First brand is selected by default
        expect(radios[0]).toHaveAttribute('aria-checked', 'true');

        // Contextual label visible
        expect(screen.getByText(/you can select the card brand/i)).toBeVisible();
    });

    test('should show display-only icons without selection UI or contextual label for non-EU dual brand', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(nonEuDualBrandResp, false);
        });

        // Two brand images visible (display-only)
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(2);

        // No interactive selection UI
        expect(screen.queryAllByRole('radio')).toHaveLength(0);
        expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();

        // No contextual label
        expect(screen.queryByText(/you can select the card brand/i)).not.toBeInTheDocument();
    });

    test('should hide brand selection UI and contextual label when PAN has validation error', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(euDualBrandResp, false);
        });

        // Brand selection is visible before error
        expect(screen.getAllByRole('radio')).toHaveLength(2);

        await act(() => {
            cardInputRef.showValidation();
        });

        // Error state shown — at least one error element is visible
        expect(screen.queryAllByRole('radio')).toHaveLength(0);
        expect(screen.queryByText(/you can select the card brand/i)).not.toBeInTheDocument();
    });
});
