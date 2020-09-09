import { h } from 'preact';
import { mount } from 'enzyme';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
    const getWrapper = props => mount(<Checkbox {...props} />);

    test('Renders a checkbox with a label', () => {
        const wrapper = getWrapper({ name: 'name', value: 'value', label: 'label' });
        expect(wrapper.find('input[type="checkbox"]').prop('className')).toContain('adyen-checkout__checkbox__input');
        expect(wrapper.find('input[type="checkbox"]').prop('value')).toBe('value');
        expect(wrapper.find('input[type="checkbox"]').prop('name')).toBe('name');
        expect(wrapper.find('span').prop('className')).toContain('adyen-checkout__checkbox__label');
        expect(wrapper.find('span').text()).toContain('label');
    });

    test('Calls onChange', () => {
        const onChange = jest.fn();
        const wrapper = getWrapper({ name: 'name', value: 'value', onChange });

        wrapper.find('label > input').simulate('change', {});
        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
