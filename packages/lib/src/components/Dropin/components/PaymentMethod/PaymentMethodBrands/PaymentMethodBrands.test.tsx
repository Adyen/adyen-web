import { h } from 'preact';
import { mount } from 'enzyme';
import PaymentMethodBrands from './PaymentMethodBrands';
import PaymentMethodIcon from '../PaymentMethodIcon';

const brands = [
    { name: 'visa', icon: 'visa.png' },
    { name: 'mc', icon: 'mc.png' },
    { name: 'amex', icon: 'amex.png' },
    { name: 'discovery', icon: 'discovery.png' },
    { name: 'vpay', icon: 'vpay.png' },
    { name: 'maestro', icon: 'maestro.png' }
];

describe('PaymentMethodBrands', () => {
    test('should render the 4 brands', () => {
        const wrapper = mount(<PaymentMethodBrands brands={brands.slice(0, 4)} />);
        expect(wrapper.find(PaymentMethodIcon)).toHaveLength(4);
    });

    test('should render the 3 brands and +2 label', () => {
        const wrapper = mount(<PaymentMethodBrands brands={brands.slice(0, 5)} />);
        expect(wrapper.find(PaymentMethodIcon)).toHaveLength(3);
        expect(wrapper.find('.adyen-checkout__payment-method__brand-number').text()).toBe('+2');
    });

    test('should render 3 brands and +3 label', () => {
        const wrapper = mount(<PaymentMethodBrands brands={brands} />);
        expect(wrapper.find(PaymentMethodIcon)).toHaveLength(3);
        expect(wrapper.find('.adyen-checkout__payment-method__brand-number').text()).toBe('+3');
    });
});
