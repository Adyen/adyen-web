import { shallow } from 'enzyme';
import { h } from 'preact';
import FieldContainer from './FieldContainer';

const propsMock = {
    errors: {},
    data: {}
};

describe('FieldContainer', () => {
    const getWrapper = (props?) => shallow(<FieldContainer {...propsMock} {...props} />);

    test('renders the StateField', () => {
        const wrapper = getWrapper({ fieldName: 'stateOrProvince' });
        expect(wrapper.find('StateField')).toHaveLength(1);
    });

    test('renders the CountryField', () => {
        const wrapper = getWrapper({ fieldName: 'country' });
        expect(wrapper.find('CountryField')).toHaveLength(1);
    });

    test('renders text fields for the other fields', () => {
        const wrapper = getWrapper({ fieldName: 'street' });
        expect(wrapper.find('InputText[name="street"]')).toHaveLength(1);
    });
});
