import { mount } from 'enzyme';
import { h } from 'preact';
import IbanInput from './IbanInput';

const i18n = { get: key => key };

const createWrapper = props => mount(<IbanInput i18n={i18n} {...props} />);

describe('IbanInput', () => {
    test('Renders two fields', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('input[name="sepa.ownerName"]')).toHaveLength(1);
        expect(wrapper.find('input[name="sepa.ibanNumber"]')).toHaveLength(1);
    });

    describe('Validation Errors', () => {
        test('Set iban errors', () => {
            const wrapper = createWrapper();
            wrapper.instance().setError('iban', true);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(1);
            expect(wrapper.find('input[name="sepa.ibanNumber"]').prop('aria-invalid')).toBe(true);

            wrapper.instance().setError('iban', false);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(0);
            expect(wrapper.find('input[name="sepa.ibanNumber"]').prop('aria-invalid')).toBe(false);
        });

        test('Set holderName errors', () => {
            const wrapper = createWrapper();
            wrapper.instance().setError('holder', true);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(1);

            wrapper.instance().setError('holder', false);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(0);
        });
    });

    describe('Validation Success', () => {
        test('Set iban validation success', () => {
            const wrapper = createWrapper();
            wrapper.instance().setValid('iban', true);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__input--valid')).toHaveLength(1);

            wrapper.instance().setValid('iban', false);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--valid')).toHaveLength(0);
        });
    });

    describe('Placeholders', () => {
        test('Set iban placeholder', () => {
            const wrapper = createWrapper({ placeholders: { ibanNumber: 'test' } });
            expect(wrapper.find('input[name="sepa.ibanNumber"]').prop('placeholder')).toBe('test');
        });

        test('Set holderName placeholder', () => {
            const wrapper = createWrapper({ placeholders: { ownerName: 'test' } });
            expect(wrapper.find('input[name="sepa.ownerName"]').prop('placeholder')).toBe('test');
        });
    });
});
