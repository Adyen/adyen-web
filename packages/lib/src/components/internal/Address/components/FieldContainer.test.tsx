import { mount } from 'enzyme';
import { h } from 'preact';
import FieldContainer from './FieldContainer';
import Specifications from '../Specifications';
import { mock } from 'jest-mock-extended';
import { FieldContainerProps } from '../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

const propsMock = {
    errors: {},
    data: {},
    valid: {},
    specifications: new Specifications()
};

const mockedProps = mock<FieldContainerProps>();
const getWrapper = (props = {}) => {
    return mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <FieldContainer {...propsMock} {...props} {...mockedProps} />
        </CoreProvider>
    );
};

describe('FieldContainer', () => {
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
