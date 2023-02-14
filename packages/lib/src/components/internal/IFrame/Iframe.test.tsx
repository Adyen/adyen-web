import { mount } from 'enzyme';
import { h } from 'preact';

const createWrapper = (props = {}) => mount(<iframe name={'test'} width={'200'} height={'300'} src={'https://www.google.com'} {...props} />);

describe('iframe', () => {
    test('Renders an iframe', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('iframe')).toHaveLength(1);
    });

    test('Has the right source', () => {
        const wrapper = createWrapper();
        expect(wrapper.getDOMNode().attributes.getNamedItem('src').value).toEqual('https://www.google.com');
    });

    test('Renders the allow property', () => {
        const wrapper = createWrapper({ allow: 'test' });
        expect(wrapper.getDOMNode().attributes.getNamedItem('allow').value).toEqual('test');
    });

    test('Has the right width and height properties', () => {
        const wrapper = createWrapper({ allow: 'test' });
        expect(wrapper.getDOMNode().attributes.getNamedItem('height').value).toEqual('300');
        expect(wrapper.getDOMNode().attributes.getNamedItem('width').value).toEqual('200');
    });
});
