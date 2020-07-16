import { mount } from 'enzyme';
import { h } from 'preact';
import CardInput from './CardInput';

jest.mock('../../../internal/SecuredFields/lib');
const i18n = { get: key => key };

describe('CardInput', () => {
    test('Renders a normal Card form', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);
        expect(wrapper.find('[data-cse="encryptedCardNumber"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedExpiryDate"]')).toHaveLength(1);
        expect(wrapper.find('[data-cse="encryptedSecurityCode"]')).toHaveLength(1);
    });

    test('Renders a oneClick Card', () => {
        const storedDetails = {
            card: {
                expiryMonth: '8',
                expiryYear: '2018',
                holderName: 'John Smith',
                number: '1111'
            }
        };

        const details = [
            {
                key: 'cardDetails.cvc',
                type: 'cvc'
            }
        ];

        const wrapper = mount(<CardInput details={details} storedDetails={storedDetails} i18n={i18n} />);
        expect(wrapper.find('[data-cse="encryptedSecurityCode"]')).toHaveLength(1);
    });

    test('hasHolderName', () => {
        const wrapper = mount(<CardInput hasHolderName={true} i18n={i18n} />);
        expect(wrapper.find('div.adyen-checkout__card__holderName')).toHaveLength(1);
    });

    test('valid holderName required', () => {
        const wrapper = mount(<CardInput holderNameRequired={true} hasHolderName={true} i18n={i18n} />);
        expect(wrapper.state('valid').holderName).toBe(false);
        wrapper.instance().handleHolderName({ target: { value: 'Name' } });
        expect(wrapper.state('valid').holderName).toBe(true);
    });

    test('valid holderName not required', () => {
        const wrapper = mount(<CardInput hasHolderName={true} i18n={i18n} />);
        expect(wrapper.state('valid').holderName).toBe(undefined);
    });
});

describe('CardInput shows/hides KCP fields when koreanAuthenticationRequired is set to true', () => {
    test('Renders a card form with kcp fields since countryCode is KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={true} countryCode="KR" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with kcp fields since countryCode is KR & issuingCountryCode is KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={true} countryCode="KR" />);
        wrapper.setState({ issuingCountryCode: 'KR' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with no kcp fields since countryCode is KR but issuingCountryCode is not KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={true} countryCode="KR" />);
        wrapper.setState({ issuingCountryCode: 'US' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('Renders a card form with no kcp fields since countryCode is not KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={true} />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('Renders a card form with kcp fields since countryCode is not KR but issuingCountryCode is KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={true} />);
        wrapper.setState({ issuingCountryCode: 'KR' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with no kcp fields since countryCode is not KR & issuingCountryCode is not KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={true} />);
        wrapper.setState({ issuingCountryCode: 'US' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});

describe('CardInput never shows KCP fields when koreanAuthenticationRequired is set to false', () => {
    test('countryCode is KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={false} countryCode="KR" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is KR & issuingCountryCode is KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={false} countryCode="KR" />);
        wrapper.setState({ issuingCountryCode: 'KR' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is KR but issuingCountryCode is not KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={false} countryCode="KR" />);
        wrapper.setState({ issuingCountryCode: 'US' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is not KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={false} />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is not KR but issuingCountryCode is KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={false} />);
        wrapper.setState({ issuingCountryCode: 'KR' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is not KR & issuingCountryCode is not KR', () => {
        const wrapper = mount(<CardInput i18n={i18n} koreanAuthenticationRequired={false} />);
        wrapper.setState({ issuingCountryCode: 'US' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});
