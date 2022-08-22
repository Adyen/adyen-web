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

    test('Renders a pay button with a secondary amount', () => {
        const wrapper = getWrapper({
            amount: { currency: 'EUR', value: 1000 },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        });
        // secondary amount indicators
        expect(wrapper.text()).toContain('/');
        expect(wrapper.text()).toContain('75.34');

        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a pay button with an amount and no secondary amount', () => {
        const wrapper = getWrapper({ amount: { currency: 'USD', value: 1000 }, secondaryAmount: undefined });
        expect(wrapper.text()).not.toContain('/');
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a zero auth pay button', () => {
        const wrapper = getWrapper({ amount: { currency: 'USD', value: 0 } });
        expect(wrapper.text()).toContain('Confirm preauthorization');
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });
});
