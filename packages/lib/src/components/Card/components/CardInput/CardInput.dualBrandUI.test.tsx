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

const dualBrandResp = {
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
    test('Renders a CardInput without dual branding', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        // Expected card fields
        expect(container.querySelector('[data-cse="encryptedCardNumber"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedExpiryDate"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedSecurityCode"]')).toBeTruthy();

        // No dual branding UI
        expect(container.querySelector('.adyen-checkout__fieldset--dual-brand-switcher')).toBeNull();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('Renders a CardInput with dual branding UI radio button elements', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(dualBrandResp, false);
        });

        expect(screen.getByText('Card Brand')).toBeInTheDocument();

        expect(screen.getByRole('radio', { name: /VISA/i })).toBeVisible();
        expect(screen.getByRole('radio', { name: /Carte Bancaire/i })).toBeVisible();
    });

    test('Dual branding UI is not hidden when the card number is in error', async () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(dualBrandResp, false);
        });

        expect(screen.getByText('Card Brand')).toBeInTheDocument();

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        // 3 error fields - all hidden
        expect(container.querySelectorAll('.adyen-checkout-contextual-text--error.adyen-checkout-contextual-text--hidden')).toHaveLength(3);

        await act(() => {
            cardInputRef.showValidation();
        });

        // 3 error fields all visible
        expect(container.querySelectorAll('.adyen-checkout-contextual-text--error.adyen-checkout-contextual-text--hidden')).toHaveLength(0);
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */

        expect(screen.getByText('Card Brand')).toBeInTheDocument();
    });
});
