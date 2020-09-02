import { mount } from 'enzyme';
import { h } from 'preact';
import PayButton from './PayButton';

describe('PayButton', () => {
    const getWrapper = (props?) => mount(<PayButton {...props} />);

    test('Renders a pay button', () => {
        const wrapper = getWrapper();
        expect(wrapper.text()).toContain('Pay');
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a pay button with an amount', () => {
        const wrapper = getWrapper({ amount: { currency: 'USD', value: 1000 } });
        expect(wrapper.text()).toContain('10.00');
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a zero auth pay button', () => {
        const wrapper = getWrapper({ amount: { currency: 'USD', value: 0 } });
        expect(wrapper.text()).toContain('Confirm preauthorization');
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });
});
