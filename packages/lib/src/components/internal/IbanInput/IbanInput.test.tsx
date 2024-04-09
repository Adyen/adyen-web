import { mount } from 'enzyme';
import { h } from 'preact';
import IbanInput from './IbanInput';
import { GenericError } from '../../../core/Errors/types';
import { CoreProvider } from '../../../core/Context/CoreProvider';

const createWrapper = (props = {}) =>
    mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {/* @ts-ignore Iban is valid TSX */}
            <IbanInput data={{}} {...props} />
        </CoreProvider>
    );

const ibanErrorObj: GenericError = {
    isValid: false,
    errorMessage: 'sepaDirectDebit.ibanField.invalid',
    error: 'sepaDirectDebit.ibanField.invalid'
};

const ibanHolderNameErrorObj: GenericError = {
    isValid: false,
    errorMessage: 'ach.accountHolderNameField.invalid',
    error: 'ach.accountHolderNameField.invalid'
};

describe('IbanInput', () => {
    test('Renders two fields', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('input[name="ownerName"]')).toHaveLength(1);
        expect(wrapper.find('input[name="ibanNumber"]')).toHaveLength(1);
    });

    describe('Validation Errors', () => {
        test('Set iban errors', () => {
            const wrapper = createWrapper();
            wrapper.find('IbanInput').instance().setError('iban', ibanErrorObj);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(1);
            expect(wrapper.find('input[name="ibanNumber"]').prop('aria-invalid')).toBe(true);

            wrapper.find('IbanInput').instance().setError('iban', false);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(0);
            expect(wrapper.find('input[name="ibanNumber"]').prop('aria-invalid')).toBe(false);
        });

        test('Set holderName errors', () => {
            const wrapper = createWrapper();
            wrapper.find('IbanInput').instance().setError('holder', ibanHolderNameErrorObj);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(1);

            wrapper.find('IbanInput').instance().setError('holder', false);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(0);
        });
    });

    describe('Validation Success', () => {
        test('Set iban validation success', () => {
            const wrapper = createWrapper();
            wrapper.find('IbanInput').instance().setValid('iban', true);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__input--valid')).toHaveLength(1);

            wrapper.find('IbanInput').instance().setValid('iban', false);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--valid')).toHaveLength(0);
        });
    });

    describe('Placeholders', () => {
        test('Set iban placeholder', () => {
            const wrapper = createWrapper({ placeholders: { ibanNumber: 'test' } });
            expect(wrapper.find('input[name="ibanNumber"]').prop('placeholder')).toBe('test');
        });

        test('Set holderName placeholder', () => {
            const wrapper = createWrapper({ placeholders: { ownerName: 'test' } });
            expect(wrapper.find('input[name="ownerName"]').prop('placeholder')).toBe('test');
        });
    });

    describe('Send values from outside', () => {
        test('Set ibanNumber', () => {
            const wrapper = createWrapper({ data: { ibanNumber: 'NL13TEST0123456789' } });
            setTimeout(() => {
                expect(wrapper.find('input[name="ibanNumber"]').text()).toBe('NL13 TEST 0123 4567 89');
            });
        });

        test('Set ibanNumber formatted', () => {
            const wrapper = createWrapper({ data: { ibanNumber: 'NL13 TEST 0123 4567 89' } });
            setTimeout(() => {
                expect(wrapper.find('input[name="ibanNumber"]').text()).toBe('NL13 TEST 0123 4567 89');
            });
        });

        test('Set ownerName', () => {
            const wrapper = createWrapper({ data: { ownerName: 'Hello World' } });
            setTimeout(() => {
                expect(wrapper.find('input[name="ownerName"]').text()).toBe('Hello World');
            });
        });

        test('Set ibanNumber and ownerName', () => {
            const wrapper = createWrapper({ data: { ibanNumber: 'NL13TEST0123456789', ownerName: 'Hello World' } });
            setTimeout(() => {
                expect(wrapper.find('input[name="ibanNumber"]').text()).toBe('NL13 TEST 0123 4567 89');
                expect(wrapper.find('input[name="ownerName"]').text()).toBe('Hello World');
            });
        });
    });
});
