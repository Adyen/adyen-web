import { h } from 'preact';
import { mount } from 'enzyme';
import Button from './Button';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { ButtonProps } from './types';

const getWrapper = (props: ButtonProps) => {
    return mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <Button {...props} />
        </CoreProvider>
    );
};

describe('Button', () => {
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

    test('Renders primary button as default', () => {
        const wrapper = getWrapper({});
        expect(wrapper.find('.adyen-checkout__button').length).toBe(1);
        expect(wrapper.find('.adyen-checkout__button--primary').length).toBe(0);
    });

    test('Renders secondary button', () => {
        const wrapper = getWrapper({ variant: 'secondary' });
        expect(wrapper.find('.adyen-checkout__button--secondary').length).toBe(1);
    });

    test('Renders action button', () => {
        const wrapper = getWrapper({ variant: 'action' });
        expect(wrapper.find('.adyen-checkout__button--action').length).toBe(1);
    });

    test('Renders ghost button', () => {
        const wrapper = getWrapper({ variant: 'ghost' });
        expect(wrapper.find('.adyen-checkout__button--ghost').length).toBe(1);
    });
});
