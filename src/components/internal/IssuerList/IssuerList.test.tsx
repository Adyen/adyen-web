import { mount } from 'enzyme';
import { h } from 'preact';
import IssuerList from './IssuerList';

describe('IssuerList', () => {
    test('Accepts Items as props', () => {
        const items = [{ name: 'Issuer 1', id: '1' }, { name: 'Issuer 2', id: '2' }, { name: 'Issuer 3', id: '3' }];
        const wrapper = mount(<IssuerList items={items} />);
        expect(wrapper.props().items).toHaveLength(3);
        expect(wrapper.find('ul li')).toHaveLength(3);
    });
});
