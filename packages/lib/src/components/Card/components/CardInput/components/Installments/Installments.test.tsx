import { h } from 'preact';
import { mount } from 'enzyme';
import Installments from './Installments';
import { InstallmentOptions } from '../types';

const installmentOptions = {
    card: {
        values: [1, 2]
    },
    mc: {
        values: [1, 2, 3]
    },
    visa: {
        values: [1, 2, 3, 4]
    }
} as InstallmentOptions;

describe('Installments', () => {
    const getWrapper = (props?) => mount(<Installments installmentOptions={installmentOptions} {...props} />);

    test('renders the installment options', () => {
        const wrapper = getWrapper();
        expect(wrapper.find('Installments')).toHaveLength(1);
    });

    test('does not render any installment options if the passed amount is 0', () => {
        const amount = { value: 0, currency: 'EUR' };
        const wrapper = getWrapper({ amount });
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(0);
    });

    test('does not render any installment options by default when no card key is passed', () => {
        const installmentOptions = {
            mc: { values: [1, 2, 3] }
        };
        const wrapper = getWrapper({ installmentOptions: installmentOptions });
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(0);
    });

    test('renders the right amount of installment options', () => {
        // card
        expect(getWrapper().find('.adyen-checkout__dropdown__element')).toHaveLength(2);

        expect(getWrapper({ brand: 'mc' }).find('.adyen-checkout__dropdown__element')).toHaveLength(3);
        expect(getWrapper({ brand: 'visa' }).find('.adyen-checkout__dropdown__element')).toHaveLength(4);
    });

    test('renders the radio button UI', () => {
        installmentOptions.visa.plans = ['regular', 'revolving'];

        // containing div - not present 'cos no brand is set
        expect(getWrapper().find('.adyen-checkout__fieldset--revolving-plan')).toHaveLength(0);

        let wrapper = getWrapper({ brand: 'visa' });
        // containing div - once brand is set
        expect(wrapper.find('.adyen-checkout__fieldset--revolving-plan')).toHaveLength(1);
        // radio buttons
        expect(wrapper.find('.adyen-checkout__radio_group__input')).toHaveLength(3);
        // dropdown
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(4);
    });

    test('does not render the radio button UI for mc', () => {
        let wrapper = getWrapper({ brand: 'mc' });
        // no containing div
        expect(wrapper.find('.adyen-checkout__fieldset--revolving-plan')).toHaveLength(0);
        // no radio buttons
        expect(wrapper.find('.adyen-checkout__radio_group__input')).toHaveLength(0);

        // dropdown
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(3);
    });
});
