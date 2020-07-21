import { mount } from 'enzyme';
import { h } from 'preact';
import Button from './Button';

const i18n = { get: key => key };

describe('Button', () => {
    const getWrapper = props => mount(<Button i18n={i18n} {...props} />);

    test('Renders a button by default', () => {
        const wrapper = getWrapper({ label: 'label' });
        expect(wrapper.text()).toContain('label');
        expect(wrapper.getDOMNode().nodeName).toBe('BUTTON');
    });

    test('Renders a link if href is present', () => {
        const wrapper = getWrapper({ label: 'label', href: 'http://adyen.com' });
        expect(wrapper.text()).toContain('label');
        expect(wrapper.getDOMNode().nodeName).toBe('A');
    });

    test('Calls onClick', () => {
        const onClick = jest.fn();
        const wrapper = getWrapper({ onClick });

        wrapper.find('button').simulate('click');
        expect(onClick.mock.calls.length).toBe(1);
    });

    test('Prevents onClick if disabled', () => {
        const onClick = jest.fn();
        const wrapper = getWrapper({ onClick, disabled: true });

        wrapper.find('button').simulate('click');
        expect(onClick.mock.calls.length).toBe(0);
    });

    test('Uses label when a status is not defined', () => {
        const onClick = jest.fn();
        const wrapper = getWrapper({ onClick, label: 'label', status: 'ready' });
        expect(wrapper.text()).toContain('label');
    });

    test('Uses a custom label when a status is defined', () => {
        const wrapper = getWrapper({ label: 'label', status: 'loading' });
        expect(wrapper.find('.adyen-checkout__spinner').length > 0).toBe(true);
    });
});
