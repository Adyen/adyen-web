import { shallow } from 'enzyme';
import { h } from 'preact';
import PaymentMethodItem from './PaymentMethodItem';

const i18n = { get: key => key };
const index = 0;
const paymentMethod = {
    _id: '123456',
    props: {
        type: 'mytype'
    },
    render: jest.fn()
};

describe('PaymentMethodItem', () => {
    const getWrapper = props => shallow(<PaymentMethodItem i18n={i18n} {...props} />);

    test('Renders a pay PaymentMethodItem', () => {
        const wrapper = getWrapper({ paymentMethod });
        expect(wrapper.hasClass('123456')).toBe(true);
        expect(wrapper.hasClass('adyen-checkout__payment-method')).toBe(true);
        expect(wrapper.hasClass('adyen-checkout__payment-method--mytype')).toBe(true);
    });

    test('Responds to events', () => {
        const onSelect = jest.fn();
        const wrapper = getWrapper({ paymentMethod, index, onSelect });

        wrapper.simulate('click');
        expect(onSelect.mock.calls.length).toBe(1);
    });

    test('Focus should NOT trigger select', () => {
        const onSelect = jest.fn();
        const wrapper = getWrapper({ paymentMethod, index, onSelect });

        wrapper.simulate('focus');
        expect(onSelect.mock.calls.length).toBe(0);
    });
});
