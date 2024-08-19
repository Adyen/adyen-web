import { mount } from 'enzyme';
import { h } from 'preact';
import CardInput from './CardInput';
import Language from '../../../../language/Language';
import { CardInputDataState, CardInputValidState } from './types';
import { render, screen, fireEvent } from '@testing-library/preact';
import { CardFieldsWrapper } from './components/CardFieldsWrapper';

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

const i18n = new Language('en-US', {});
const configuration = { koreanAuthenticationRequired: true };

describe('CardInput', () => {
    test('Renders a normal Card form', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);
        expect(wrapper.find('[data-cse="encryptedCardNumber"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedExpiryDate"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedSecurityCode"]')).toHaveLength(1);
    });

    test('Renders a oneClick Card', () => {
        const storedCardData = {
            brand: 'visa',
            expiryMonth: '03',
            expiryYear: '2030',
            holderName: 'Checkout Shopper PlaceHolder',
            id: '8415611088427239',
            lastFour: '1111',
            name: 'VISA',
            storedPaymentMethodId: '8415611088427239',
            supportedShopperInteractions: ['ContAuth', 'Ecommerce'],
            type: 'scheme'
        };

        const wrapper = mount(<CardInput storedDetails={storedCardData} i18n={i18n} />);
        expect(wrapper.find('[data-cse="encryptedSecurityCode"]')).toHaveLength(1);
    });

    test('Has HolderName element', () => {
        const wrapper = mount(<CardInput hasHolderName={true} i18n={i18n} />);
        expect(wrapper.find('div.adyen-checkout__card__holderName')).toHaveLength(1);
    });
});

describe('CardInput - Brands beneath Card Number field', () => {
    test('should not render brands if property `showBrandsUnderCardNumber` is set to false', () => {
        const wrapper = mount(<CardInput i18n={i18n} showBrandsUnderCardNumber={false} />);
        expect(wrapper.find('span.adyen-checkout__card__brands').exists()).toBeFalsy();
    });

    test('should render brands if property `showBrandsUnderCardNumber` is set', () => {
        const brandsIcons = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' }
        ];
        const wrapper = mount(<CardInput i18n={i18n} showBrandsUnderCardNumber brandsIcons={brandsIcons} />);
        expect(wrapper.find('.adyen-checkout__card__brands__brand-wrapper')).toHaveLength(2);
        expect(wrapper.find('.adyen-checkout__card__brands__brand-wrapper--disabled')).toHaveLength(0);
    });

    test('should render brands if property `showBrandsUnderCardNumber` is not set', () => {
        const brandsIcons = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' }
        ];
        const wrapper = mount(<CardInput i18n={i18n} brandsIcons={brandsIcons} />);
        expect(wrapper.find('.adyen-checkout__card__brands__brand-wrapper')).toHaveLength(2);
        expect(wrapper.find('.adyen-checkout__card__brands__brand-wrapper--disabled')).toHaveLength(0);
    });

    test('should hide all brand icons when brand is detected', () => {
        const detectedBrand = 'visa';
        const brandsIcons = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' }
        ];
        const wrapper = mount(<CardInput i18n={i18n} brand={detectedBrand} brandsIcons={brandsIcons} />);
        expect(wrapper.find('.adyen-checkout__card__brands--hidden')).toHaveLength(1);
    });

    test('should show all brand icons when no brand is detected', () => {
        const detectedBrand = 'card';
        const brandsIcons = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' }
        ];
        const wrapper = mount(<CardInput i18n={i18n} brand={detectedBrand} brandsIcons={brandsIcons} />);
        expect(wrapper.find('.adyen-checkout__card__brands--hidden')).toHaveLength(0);
    });
});

describe('CardInput > holderName', () => {
    test('Does not have HolderName element', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);
        expect(wrapper.find('div.adyen-checkout__card__holderName')).toHaveLength(0);
    });

    test('holderName required, so valid.holderName is false', () => {
        mount(<CardInput holderNameRequired={true} hasHolderName={true} onChange={onChange} i18n={i18n} />);
        // expect(onChange.mock.calls[onChange.mock.calls.length - 1][0].valid.holderName).toBe(false);
        expect(valid.holderName).toBe(false);
    });

    test('holderName required, valid.holderName is false, add text to make valid.holderName = true', () => {
        render(<CardInput holderNameRequired={true} hasHolderName={true} onChange={onChange} i18n={i18n} />);
        expect(valid.holderName).toBe(false);

        const placeholderText = i18n.get('creditCard.holderName.placeholder');

        const field = screen.getByPlaceholderText(placeholderText);
        fireEvent.blur(field, { target: { value: 'joe blogs' } });

        // await waitFor(() => {
        expect(data.holderName).toBe('joe blogs');
        expect(valid.holderName).toBe(true);
        // });
    });

    test('holderName required, data.holderName passed into comp - valid.holderName is true', () => {
        const dataObj = { holderName: 'J Smith' };
        mount(<CardInput holderNameRequired={true} hasHolderName={true} data={dataObj} onChange={onChange} i18n={i18n} />);
        expect(valid.holderName).toBe(true);
        expect(data.holderName).toBe('J Smith');
    });

    test('holderName not required, valid.holderName is true', () => {
        mount(<CardInput hasHolderName={true} onChange={onChange} i18n={i18n} />);

        expect(valid.holderName).toBe(true);
    });

    test('holderName not required, data.holderName passed into comp - valid.holderName is true', () => {
        const dataObj = { holderName: 'J Smith' };
        mount(<CardInput hasHolderName={true} data={dataObj} onChange={onChange} i18n={i18n} />);

        expect(valid.holderName).toBe(true);
        expect(data.holderName).toBe('J Smith');
    });

    test('holderName ', () => {
        const dataObj = { holderName: 'J Smith' };
        mount(<CardInput hasHolderName={true} data={dataObj} onChange={onChange} i18n={i18n} />);

        expect(valid.holderName).toBe(true);
        expect(data.holderName).toBe('J Smith');
    });

    test('does not show the holder name first by default', () => {
        render(<CardInput hasHolderName={true} i18n={i18n} />);

        const select = screen.getByRole('form');
        // eslint-disable-next-line testing-library/no-node-access
        const children = select.children;

        const positionDiv = children.item(0);
        // eslint-disable-next-line testing-library/no-node-access
        const positionDivChildren = positionDiv.children;

        const loadingWrapper = positionDivChildren.item(1); // children.item(0) is the spinner
        // eslint-disable-next-line testing-library/no-node-access
        const loadingWrapperChildren = loadingWrapper.children;

        // First visible element is the Card number
        const firstFormElement = loadingWrapperChildren.item(0);
        // eslint-disable-next-line testing-library/no-node-access
        const firstFormElementChildren = firstFormElement.children;

        const label = firstFormElementChildren.item(0);
        // eslint-disable-next-line testing-library/no-node-access
        const labelChildren = label.children;

        expect(labelChildren.item(0).textContent).toEqual('Card number');
    });

    test('holder name is first visible element', () => {
        // const wrapper = mount(<CardInput hasHolderName={true} positionHolderNameOnTop={true} i18n={i18n} />);
        // expect(wrapper.find('CardHolderName:first-child')).toHaveLength(1);

        render(<CardInput hasHolderName={true} positionHolderNameOnTop={true} i18n={i18n} />);

        const select = screen.getByRole('form');
        // eslint-disable-next-line testing-library/no-node-access
        const children = select.children;

        const positionDiv = children.item(0);
        // eslint-disable-next-line testing-library/no-node-access
        const positionDivChildren = positionDiv.children;

        const loadingWrapper = positionDivChildren.item(1); // children.item(0) is the spinner
        // eslint-disable-next-line testing-library/no-node-access
        const loadingWrapperChildren = loadingWrapper.children;

        // First visible element is the Holder name
        const firstFormElement = loadingWrapperChildren.item(0);
        // eslint-disable-next-line testing-library/no-node-access
        const firstFormElementChildren = firstFormElement.children;

        const label = firstFormElementChildren.item(0);
        // eslint-disable-next-line testing-library/no-node-access
        const labelChildren = label.children;

        expect(labelChildren.item(0).textContent).toEqual('Name on card');
    });
});

describe('CardInput shows/hides KCP fields when koreanAuthenticationRequired is set to true and either countryCode or issuingCountryCode is set to kr', () => {
    let cardInputRef;
    const setComponentRef = ref => {
        cardInputRef = ref;
    };

    test('Renders a card form with kcp fields since countryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with kcp fields since countryCode is kr & issuingCountryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" setComponentRef={setComponentRef} />);
        cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'kr' }, false);
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with kcp fields since countryCode is not kr but issuingCountryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} setComponentRef={setComponentRef} />);
        cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'kr' }, false);
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with no kcp fields since countryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('Renders a card form with no kcp fields since countryCode is kr but issuingCountryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" setComponentRef={setComponentRef} />);
        cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'us' }, false);
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('Renders a card form with no kcp fields since countryCode is not kr & issuingCountryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} setComponentRef={setComponentRef} />);
        cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'us' }, false);
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});

describe('CardInput never shows KCP fields when koreanAuthenticationRequired is set to false', () => {
    test('countryCode is kr', () => {
        configuration.koreanAuthenticationRequired = false;
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is kr & issuingCountryCode is kr', () => {
        let cardInputRef;
        const setComponentRef = ref => {
            cardInputRef = ref;
        };

        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" setComponentRef={setComponentRef} />);
        cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'kr' }, false);
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});

describe('CardInput > Installments', () => {
    const installments = {
        mc: {
            values: [1, 2, 3]
        }
    };
    test('should not display installments if fundingSource is debit', () => {
        const wrapper = mount(<CardInput fundingSource={'debit'} i18n={i18n} installmentOptions={installments} />);
        expect(wrapper.find(CardFieldsWrapper).prop('hasInstallments')).toBe(false);
    });
    test('should display installments if fundingSource is credit', () => {
        const wrapper = mount(<CardInput fundingSource={'credit'} i18n={i18n} installmentOptions={installments} />);
        expect(wrapper.find(CardFieldsWrapper).prop('hasInstallments')).toBe(true);
    });
    test('should display installments if fundingSource undefined', () => {
        const wrapper = mount(<CardInput i18n={i18n} installmentOptions={installments} />);
        expect(wrapper.find(CardFieldsWrapper).prop('hasInstallments')).toBe(true);
    });
});
