import { mount } from 'enzyme';
import { h } from 'preact';
import CardInput from './CardInput';
import CSF from '../../../internal/SecuredFields/lib';

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
