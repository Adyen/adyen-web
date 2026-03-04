import { h } from 'preact';
import { render, screen, act } from '@testing-library/preact';
import CardInput from './CardInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

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
            {ui}
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

    test('Renders a CardInput with dual branding UI radio button elements', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

        void act(() => {
            cardInputRef.processBinLookupResponse(dualBrandResp, false);
        });

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        //  Dual branding UI visible
        const dualBrandEl = container.querySelector('.adyen-checkout__fieldset--dual-brand-switcher');
        expect(dualBrandEl).toBeTruthy();

        // title
        expect(dualBrandEl.querySelector('.adyen-checkout__fieldset__title')).toBeTruthy();

        // subTitle
        expect(dualBrandEl.querySelector('legend')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */

        // radio group
        expect(screen.getByRole('radiogroup')).toBeTruthy();

        // buttons
        expect(screen.getAllByRole('radio')).toHaveLength(2);

        // check images
        const radioLabels = screen.getAllByRole('radio');

        /* eslint-disable testing-library/no-node-access */
        const firstLabel = radioLabels[0].closest('.adyen-checkout__radio_group__input-wrapper');
        const secondLabel = radioLabels[1].closest('.adyen-checkout__radio_group__input-wrapper');

        expect(firstLabel.querySelector('img').getAttribute('alt')).toEqual('VISA');
        expect(secondLabel.querySelector('img').getAttribute('alt')).toEqual('cartebancaire');

        // check texts
        expect(firstLabel.textContent).toContain('VISA');
        expect(secondLabel.textContent).toContain('Carte Bancaire');
        /* eslint-enable testing-library/no-node-access */
    });

    test('Dual branding UI is not hidden when the card number is in error', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

        void act(() => {
            cardInputRef.processBinLookupResponse(dualBrandResp, false);
        });

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        //  Dual branding UI visible
        expect(container.querySelector('.adyen-checkout__fieldset--dual-brand-switcher')).toBeTruthy();

        // 3 error fields - all hidden
        expect(container.querySelectorAll('.adyen-checkout-contextual-text--error.adyen-checkout-contextual-text--hidden')).toHaveLength(3);

        void act(() => {
            cardInputRef.showValidation();
        });

        // 3 error fields all visible
        expect(container.querySelectorAll('.adyen-checkout-contextual-text--error.adyen-checkout-contextual-text--hidden')).toHaveLength(0);

        //  Dual branding UI still visible
        expect(container.querySelector('.adyen-checkout__fieldset--dual-brand-switcher')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });
});
