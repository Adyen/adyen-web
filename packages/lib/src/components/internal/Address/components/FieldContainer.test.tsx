import { shallow } from 'enzyme';
import { h } from 'preact';
import FieldContainer from './FieldContainer';
import Specifications from '../Specifications';
import { mock } from 'jest-mock-extended';
import { FieldContainerProps } from '../types';

const propsMock = {
    errors: {},
    data: {},
    valid: {},
    specifications: new Specifications()
};

describe('FieldContainer', () => {
    const mockedProps = mock<FieldContainerProps>();
    const getWrapper = (props = {}) => shallow(<FieldContainer {...propsMock} {...props} {...mockedProps} />);

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
