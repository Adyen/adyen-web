import { shallow } from 'enzyme';
import { h } from 'preact';
import PaymentMethodItem from './PaymentMethodItem';

const i18n = { get: key => key };
const index = 0;
const paymentMethod = {
    props: {
        id: '123456',
        type: 'mytype'
    },
    eventEmitter: { on: jest.fn(), off: jest.fn() },
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

        wrapper.simulate('focus');
        expect(onSelect.mock.calls.length).toBe(2);
    });

    test('Defaults events', () => {
        const wrapper = getWrapper({ paymentMethod });
        wrapper.simulate('click');
    });

    test('Ignores focus during mouse down', () => {
        const onSelect = jest.fn();
        const wrapper = getWrapper({ paymentMethod, index, onSelect });

        wrapper.simulate('mousedown');
        wrapper.simulate('focus');
        expect(onSelect.mock.calls.length).toBe(0);

        wrapper.simulate('mouseup');
        wrapper.simulate('focus');
        expect(onSelect.mock.calls.length).toBe(1);
    });
});
