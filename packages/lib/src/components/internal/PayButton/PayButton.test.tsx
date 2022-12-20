import { mount } from 'enzyme';
import { h } from 'preact';
import PayButton, { PayButtonProps } from './PayButton';
import { PAY_BTN_DIVIDER } from './utils';
import { mock } from 'jest-mock-extended';

describe('PayButton', () => {
    const mockedProps = mock<PayButtonProps>();
    const getWrapper = (props = {}) => mount(<PayButton {...props} {...mockedProps} />);

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
        expect(wrapper.text()).toContain(PAY_BTN_DIVIDER);
        expect(wrapper.text()).toContain('75.34');

        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a pay button with an amount and no secondary amount so there should be no secondary amount', () => {
        const wrapper = getWrapper({ amount: { currency: 'USD', value: 1000 }, secondaryAmount: undefined });
        expect(wrapper.text()).not.toContain(PAY_BTN_DIVIDER);
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a pay button with no amount so there should be no secondary amount', () => {
        const wrapper = getWrapper({ secondaryAmount: { currency: 'HRK', value: 7534 } });
        expect(wrapper.text()).not.toContain(PAY_BTN_DIVIDER);
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a pay button with a specific label so there should be no secondary amount', () => {
        const wrapper = getWrapper({
            label: 'Redirect to',
            amount: { currency: 'USD', value: 1000 },
            secondaryAmount: { currency: 'HRK', value: 7534 }
        });
        expect(wrapper.text()).not.toContain(PAY_BTN_DIVIDER);
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a zero auth pay button', () => {
        const wrapper = getWrapper({ amount: { currency: 'USD', value: 0 } });
        expect(wrapper.text()).toContain('Confirm preauthorization');
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a zero auth pay button so there should be no secondary amount', () => {
        const wrapper = getWrapper({ amount: { currency: 'USD', value: 0 }, secondaryAmount: { currency: 'HRK', value: 7534 } });
        expect(wrapper.text()).toContain('Confirm preauthorization');
        expect(wrapper.text()).not.toContain(PAY_BTN_DIVIDER);
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });
});
