import { h } from 'preact';
import { mount } from 'enzyme';
import PaymentMethodBrands from './PaymentMethodBrands';
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

describe('PaymentMethodBrands', () => {
    test('should render compact view if prop is set', () => {
        const wrapper = mount(<PaymentMethodBrands brands={brands} isPaymentMethodSelected={false} isCompactView />);
        expect(wrapper.find(CompactView)).toHaveLength(1);
    });

    test('should render compact view if prop is not', () => {
        const wrapper = mount(<PaymentMethodBrands brands={brands} isPaymentMethodSelected />);
        expect(wrapper.find(CompactView)).toHaveLength(1);
    });

    test('should not render compact view if prop is set to false', () => {
        const wrapper = mount(<PaymentMethodBrands brands={brands} isPaymentMethodSelected isCompactView={false} />);
        expect(wrapper.find(PaymentMethodIcon)).toHaveLength(6);
    });
});
