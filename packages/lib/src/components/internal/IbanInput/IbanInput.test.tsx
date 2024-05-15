import { mount } from 'enzyme';
import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import IbanInput from './IbanInput';
import { GenericError } from '../../../core/Errors/types';

const i18n = { get: key => key };

// @ts-ignore is valid tsx
const createWrapper = (props = {}) => mount(<IbanInput i18n={i18n} {...props} />);

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
            wrapper.instance().setError('iban', ibanErrorObj);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(1);
            expect(wrapper.find('input[name="ibanNumber"]').prop('aria-invalid')).toBe(true);

            wrapper.instance().setError('iban', false);
            wrapper.update();
            expect(wrapper.find('.adyen-checkout__field--error')).toHaveLength(0);
            expect(wrapper.find('input[name="ibanNumber"]').prop('aria-invalid')).toBe(false);
        });

        test('Set holderName errors', () => {
            const wrapper = createWrapper();
            wrapper.instance().setError('holder', ibanHolderNameErrorObj);
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
            expect(wrapper.find('input[name="ibanNumber"]').prop('placeholder')).toBe('test');
        });

        test('Set holderName placeholder', () => {
            const wrapper = createWrapper({ placeholders: { ownerName: 'test' } });
            expect(wrapper.find('input[name="ownerName"]').prop('placeholder')).toBe('test');
        });
    });

    describe('Send values from outside', () => {
        const createElement = (props = {}) => {
            return (
                // @ts-ignore is valid tsx
                <IbanInput data={{}} {...props} />
            );
        };

        test('Set ibanNumber', async () => {
            const el = createElement({ data: { ibanNumber: 'NL13TEST0123456789' } });
            render(el);

            const inputEl = await screen.findByLabelText('Account Number (IBAN)');

            // @ts-ignore method does exist
            expect(inputEl).toHaveValue('NL13 TEST 0123 4567 89');
        });

        test('Set ibanNumber formatted', async () => {
            const el = createElement({ data: { ibanNumber: 'NL13 TEST 0123 4567 89' } });
            render(el);

            const inputEl = await screen.findByLabelText('Account Number (IBAN)');

            // @ts-ignore method does exist
            expect(inputEl).toHaveValue('NL13 TEST 0123 4567 89');
        });

        test('Set ownerName', async () => {
            const el = createElement({ data: { ownerName: 'Hello World' } });
            render(el);

            const inputEl = await screen.findByLabelText('Holder Name');

            // @ts-ignore method does exist
            expect(inputEl).toHaveValue('Hello World');
        });
    });
});
