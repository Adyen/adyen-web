import { mount } from 'enzyme';
import { h } from 'preact';
import CardInput from './CardInput';
import Language from '../../../../language/Language';

jest.mock('../../../internal/SecuredFields/lib');

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

    test('hasHolderName', () => {
        const wrapper = mount(<CardInput hasHolderName={true} i18n={i18n} />);
        expect(wrapper.find('div.adyen-checkout__card__holderName')).toHaveLength(1);
    });

    test('does not show the holder name first by default', () => {
        const wrapper = mount(<CardInput hasHolderName={true} i18n={i18n} />);
        expect(wrapper.find('CardHolderName')).toHaveLength(1);
        expect(wrapper.find('CardHolderName:first-child')).toHaveLength(0);
    });

    test('shows holder name first', () => {
        const wrapper = mount(<CardInput hasHolderName={true} positionHolderNameOnTop={true} i18n={i18n} />);
        expect(wrapper.find('CardHolderName:first-child')).toHaveLength(1);
    });
});

describe('CardInput shows/hides KCP fields when koreanAuthenticationRequired is set to true', () => {
    test('Renders a card form with kcp fields since countryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with no kcp fields since countryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});

describe('CardInput never shows KCP fields when koreanAuthenticationRequired is set to false', () => {
    test('countryCode is kr', () => {
        configuration.koreanAuthenticationRequired = false;
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});
