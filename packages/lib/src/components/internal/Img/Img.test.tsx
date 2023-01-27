import { shallow } from 'enzyme';
import { h } from 'preact';
import Img from './Img';

describe('Image', () => {
    const getWrapper = (props = {}) => shallow(<Img {...props} />);

    test('renders a component', () => {
        const wrapper = getWrapper();
        expect(wrapper.is('img')).toBe(true);
        expect(wrapper.hasClass('adyen-checkout__image')).toBe(true);
    });

    test('has passed className', () => {
        const wrapper = getWrapper({ className: 'abc123' });
        expect(wrapper.find('img').hasClass('abc123')).toBe(true);
    });
});
