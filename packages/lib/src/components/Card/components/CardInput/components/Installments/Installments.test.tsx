import { h } from 'preact';
import { mount } from 'enzyme';
import Installments from './Installments';

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
};

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
        const wrapper = getWrapper();
        expect(getWrapper().find('.adyen-checkout__dropdown__element')).toHaveLength(2);
        expect(getWrapper({ brand: 'mc' }).find('.adyen-checkout__dropdown__element')).toHaveLength(3);
        expect(getWrapper({ brand: 'visa' }).find('.adyen-checkout__dropdown__element')).toHaveLength(4);
    });
});
