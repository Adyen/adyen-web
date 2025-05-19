import { h } from 'preact';
import { mount } from 'enzyme';
import CardInput from './CardInput';
import { CardInputDataState, CardInputValidState } from './types';
import { render, screen, fireEvent } from '@testing-library/preact';
import { CardFieldsWrapper } from './components/CardFieldsWrapper';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

jest.mock('../../../internal/SecuredFields/lib/CSF');

let valid = {} as CardInputValidState;
let data = {} as CardInputDataState;
let onChange;
beforeEach(() => {
    onChange = jest.fn((state): any => {
        valid = state.valid;
        data = state.data;
    });
});

const i18n = global.i18n;
const configuration = { koreanAuthenticationRequired: true };

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

const getWrapper = ui => {
    return mount(
        // @ts-ignore
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );
};

describe('CardNumber and the dual branding UI', () => {
    test.skip('Renders a CardInput without dual branding', () => {
        const wrapper = getWrapper(<CardInput {...cardInputRequiredProps} />);

        // Expected card fields
        expect(wrapper.find('[data-cse="encryptedCardNumber"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedExpiryDate"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedSecurityCode"]')).toHaveLength(1);

        // No dual branding UI
        expect(wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher')).toHaveLength(0);
    });

    test('Renders a CardInput with dual branding UI radio button elements', async () => {
        // TODO find a way to set dualBrandSelectElements on CardInput
        // wrapper.setProps({ dualBrandSelectElements: [{ id: 'visa' }, { id: 'cartebancaire' }] });
        //  Dual branding UI visible
        //  expect(wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher')).toHaveLength(1);
        // TODO test for:
        //  - title (fieldset's legend)
        //  - subTitle (label)
        //  - radio group (.adyen-checkout__radio_group--button)
        //  - individual radio buttons (input type="radio")
        const wrapper = getWrapper(<CardInput {...cardInputRequiredProps} />);

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

        cardInputRef.processBinLookupResponse(dualBrandResp, false);

        wrapper.update();

        //  Dual branding UI visible
        const dualBrandEl = wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher');
        expect(dualBrandEl).toHaveLength(1);

        // console.log('### CardInput_dualBrandUI.test:::: dbs', dbs);

        // title
        expect(dualBrandEl.find('.adyen-checkout__fieldset__title')).toHaveLength(1);

        // subTitle
        expect(dualBrandEl.find('legend')).toHaveLength(1);

        // radio group
        expect(dualBrandEl.find('[role="radiogroup"]')).toHaveLength(1);

        // buttons
        // expect(dualBrandEl.find('.adyen-checkout__radio_group__input')).toHaveLength(2);
        expect(dualBrandEl.find('[type="radio"]')).toHaveLength(2);
        // await screen.findByRole('button', { name: 'Confirm purchase' });
        // expect(await screen.findByRole('button')).toHaveTextContent('visa');
    });

    test.skip('Dual branding UI is not hidden when the card number is in error', () => {
        // wrapper.setProps({ error: true });
        // expect(wrapper.find('.adyen-checkout__fieldset--dual-brand-switcher')).toHaveLength(0);
    });
});

// describe('CardInput', () => {
//     test('Renders a normal Card form', () => {
//         const wrapper = getWrapper(<CardInput {...cardInputRequiredProps} />);
//         expect(wrapper.find('[data-cse="encryptedCardNumber"]')).toHaveLength(1);
//         expect(wrapper.find('[data-cse="encryptedExpiryDate"]')).toHaveLength(1);
//         expect(wrapper.find('[data-cse="encryptedSecurityCode"]')).toHaveLength(1);
//     });
//
//     test('Has HolderName element', () => {
//         const wrapper = getWrapper(<CardInput {...cardInputRequiredProps} hasHolderName={true} />);
//         expect(wrapper.find('div.adyen-checkout__card__holderName')).toHaveLength(1);
//     });
// });
