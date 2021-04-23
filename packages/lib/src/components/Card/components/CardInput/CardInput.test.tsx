import { mount } from 'enzyme';
import { h } from 'preact';
import CardInput from './CardInput';
import Language from '../../../../language/Language';

jest.mock('../../../internal/SecuredFields/lib');

const i18n = new Language('en-US', {});

const configuration = { koreanAuthenticationRequired: true };

describe.skip('CardInput', () => {
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

    test('does not show the holder name first by default', () => {
        const wrapper = mount(<CardInput hasHolderName={true} i18n={i18n} />);
        expect(wrapper.find('CardHolderName')).toHaveLength(1);
        expect(wrapper.find('CardHolderName:first-child')).toHaveLength(0);
    });

    test('shows holder name first', () => {
        const wrapper = mount(<CardInput hasHolderName={true} positionHolderNameOnTop={true} i18n={i18n} />);
        expect(wrapper.find('CardHolderName:first-child')).toHaveLength(1);
    });

    test('issuingCountryCode state var is converted to lowerCase', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);
        wrapper.instance().processBinLookupResponse({ issuingCountryCode: 'KR' });
        wrapper.update();
        console.log('wrapper.instance().state=', wrapper.instance().state);
        expect(wrapper.instance().state.issuingCountryCode).toEqual('kr');
    });
});

describe.skip('CardInput shows/hides KCP fields when koreanAuthenticationRequired is set to true', () => {
    test('Renders a card form with kcp fields since countryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with kcp fields since countryCode is kr & issuingCountryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        wrapper.setState({ issuingCountryCode: 'kr' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with no kcp fields since countryCode is kr but issuingCountryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        wrapper.setState({ issuingCountryCode: 'us' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('Renders a card form with no kcp fields since countryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('Renders a card form with kcp fields since countryCode is not kr but issuingCountryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        wrapper.setState({ issuingCountryCode: 'kr' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(1);
    });

    test('Renders a card form with no kcp fields since countryCode is not kr & issuingCountryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        wrapper.setState({ issuingCountryCode: 'us' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});

describe.skip('CardInput never shows KCP fields when koreanAuthenticationRequired is set to false', () => {
    test('countryCode is kr', () => {
        configuration.koreanAuthenticationRequired = false;
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is kr & issuingCountryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        wrapper.setState({ issuingCountryCode: 'kr' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is kr but issuingCountryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} countryCode="kr" />);
        wrapper.setState({ issuingCountryCode: 'us' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is not kr but issuingCountryCode is kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        wrapper.setState({ issuingCountryCode: 'kr' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });

    test('countryCode is not kr & issuingCountryCode is not kr', () => {
        const wrapper = mount(<CardInput i18n={i18n} configuration={configuration} />);
        wrapper.setState({ issuingCountryCode: 'us' });
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__card__kcp-authentication')).toHaveLength(0);
    });
});

describe.skip('Test mock binLookup results on CardInput.state', () => {
    const dualBrandObj1 = {
        brand: 'visa',
        cvcPolicy: 'required',
        enableLuhnCheck: 'true',
        showExpiryDate: 'true',
        supported: 'true'
    };

    const dualBrandObj2 = {
        brand: 'cartebancaire',
        cvcPolicy: 'required',
        enableLuhnCheck: 'true',
        showExpiryDate: 'true',
        supported: 'true'
    };

    const mockBinLookupObj_dual = {
        issuingCountryCode: 'FR',
        supportedBrands: [dualBrandObj1, dualBrandObj2]
    };

    const mockBinLookupObj_single = {
        issuingCountryCode: 'US',
        supportedBrands: [
            {
                brand: 'mc',
                cvcPolicy: 'required',
                enableLuhnCheck: 'true',
                showExpiryDate: 'true',
                supported: 'true'
            }
        ]
    };

    test('CardInput.state contains expected values from a "dual-branded" lookup result', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);

        const cardInput = wrapper.instance();

        cardInput.processBinLookupResponse(mockBinLookupObj_dual);
        wrapper.update();

        let state = cardInput.state;

        expect(state.issuingCountryCode).toEqual('fr');
        expect(state.additionalSelectElements).toEqual([
            { id: 'visa', brandObject: dualBrandObj1 },
            { id: 'cartebancaire', brandObject: dualBrandObj2 }
        ]);
    });

    test('CardInput.state is altered when a "dual-branded" lookup result is followed by a "single" lookup result ', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);

        const cardInput = wrapper.instance();

        cardInput.processBinLookupResponse(mockBinLookupObj_dual);
        wrapper.update();

        let state = cardInput.state;

        expect(state.issuingCountryCode).toEqual('fr');
        expect(state.additionalSelectElements).toEqual([
            { id: 'visa', brandObject: dualBrandObj1 },
            { id: 'cartebancaire', brandObject: dualBrandObj2 }
        ]);

        cardInput.processBinLookupResponse(mockBinLookupObj_single);
        wrapper.update();

        state = cardInput.state;

        expect(state.issuingCountryCode).toEqual('us');
        expect(state.additionalSelectElements).toEqual([]);
        expect(state.additionalSelectValue).toEqual('mc');
    });

    test('CardInput.state is altered when a "dual-branded" lookup result is followed by a "reset" result ', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);

        const cardInput = wrapper.instance();

        cardInput.processBinLookupResponse(mockBinLookupObj_dual);
        wrapper.update();

        let state = cardInput.state;

        expect(state.issuingCountryCode).toEqual('fr');
        expect(state.additionalSelectElements).toEqual([
            { id: 'visa', brandObject: dualBrandObj1 },
            { id: 'cartebancaire', brandObject: dualBrandObj2 }
        ]);

        cardInput.processBinLookupResponse(null);
        wrapper.update();

        state = cardInput.state;

        expect(state.issuingCountryCode).toEqual(null);
        expect(state.additionalSelectElements).toEqual([]);
        expect(state.additionalSelectValue).toEqual('');
    });

    test('CardInput.state is altered when a "single" lookup result is followed by a "reset" result ', () => {
        const wrapper = mount(<CardInput i18n={i18n} />);

        const cardInput = wrapper.instance();

        cardInput.processBinLookupResponse(mockBinLookupObj_single);
        wrapper.update();

        let state = cardInput.state;

        expect(state.issuingCountryCode).toEqual('us');
        expect(state.additionalSelectElements).toEqual([]);
        expect(state.additionalSelectValue).toEqual('mc');

        cardInput.processBinLookupResponse(null);
        wrapper.update();

        state = cardInput.state;

        expect(state.issuingCountryCode).toEqual(null);
        expect(state.additionalSelectElements).toEqual([]);
        expect(state.additionalSelectValue).toEqual('');
    });
});
