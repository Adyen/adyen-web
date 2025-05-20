import { h } from 'preact';
import { mount } from 'enzyme';
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

const getWrapper = ui => {
    return mount(
        // @ts-ignore
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );
};

describe('CardNumber and the dual branding UI', () => {
    test('Renders a CardInput without dual branding', () => {
        const wrapper = getWrapper(<CardInput {...cardInputRequiredProps} />);

        // Expected card fields
        expect(wrapper.find('[data-cse="encryptedCardNumber"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedExpiryDate"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedSecurityCode"]')).toHaveLength(1);

        // No dual branding UI
        expect(wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher')).toHaveLength(0);
    });

    test('Renders a CardInput with dual branding UI radio button elements', async () => {
        const wrapper = getWrapper(<CardInput {...cardInputRequiredProps} />);

        cardInputRef.processBinLookupResponse(dualBrandResp, false);

        wrapper.update();

        //  Dual branding UI visible
        const dualBrandEl = wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher');
        expect(dualBrandEl).toHaveLength(1);

        // title
        expect(dualBrandEl.find('.adyen-checkout__fieldset__title')).toHaveLength(1);

        // subTitle
        expect(dualBrandEl.find('legend')).toHaveLength(1);

        // radio group
        expect(dualBrandEl.find('[role="radiogroup"]')).toHaveLength(1);

        // buttons
        expect(dualBrandEl.find('[type="radio"]')).toHaveLength(2);

        expect(dualBrandEl.find('[data-value="visa"]')).toHaveLength(1);
        expect(dualBrandEl.find('[data-value="cartebancaire"]')).toHaveLength(1);
    });

    test('Dual branding UI is not hidden when the card number is in error', async () => {
        const wrapper = getWrapper(<CardInput {...cardInputRequiredProps} />);

        cardInputRef.processBinLookupResponse(dualBrandResp, false);
        wrapper.update();

        //  Dual branding UI visible
        expect(wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher')).toHaveLength(1);

        // 4 error fields - all hidden (three for the securedFields, one for the dual brand switcher)
        expect(wrapper.find('.adyen-checkout-contextual-text--error.adyen-checkout-contextual-text--hidden')).toHaveLength(4);

        cardInputRef.showValidation();
        wrapper.update();

        // 3 error fields (or the securedFields) - all visible, so only the one for the dual brand switcher still hidden
        expect(wrapper.find('.adyen-checkout-contextual-text--error.adyen-checkout-contextual-text--hidden')).toHaveLength(1);

        //  Dual branding UI still visible
        expect(wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher')).toHaveLength(1);
    });
});
