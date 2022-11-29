import { h } from 'preact';
import { mount } from 'enzyme';
import CompactView from './CompactView';
import PaymentMethodIcon from '../PaymentMethodIcon';

const brands = [
    { name: 'visa', icon: 'visa.png' },
    { name: 'mc', icon: 'mc.png' },
    { name: 'amex', icon: 'amex.png' },
    { name: 'discovery', icon: 'discovery.png' },
    { name: 'vpay', icon: 'vpay.png' },
    { name: 'maestro', icon: 'maestro.png' }
];

describe('CompactView', () => {
    test('should render the 4 brands', () => {
        const wrapper = mount(<CompactView allowedBrands={brands.slice(0, 4)} isPaymentMethodSelected={false} />);
        expect(wrapper.find(PaymentMethodIcon)).toHaveLength(4);
    });

    test('should render the 3 brands and +2 label', () => {
        const wrapper = mount(<CompactView allowedBrands={brands.slice(0, 5)} isPaymentMethodSelected={false} />);
        expect(wrapper.find(PaymentMethodIcon)).toHaveLength(3);
        expect(wrapper.find('.adyen-checkout__payment-method__brand-number').text()).toBe('+2');
    });

    test('should render 3 brands and +3 label', () => {
        const wrapper = mount(<CompactView allowedBrands={brands} isPaymentMethodSelected={false} />);
        expect(wrapper.find(PaymentMethodIcon)).toHaveLength(3);
        expect(wrapper.find('.adyen-checkout__payment-method__brand-number').text()).toBe('+3');
    });
    test('should not render if payment method is selected', () => {
        const wrapper = mount(<CompactView allowedBrands={brands} isPaymentMethodSelected />);
        expect(wrapper.find('.adyen-checkout__payment-method__brand-number').length).toBe(0);
    });
});
