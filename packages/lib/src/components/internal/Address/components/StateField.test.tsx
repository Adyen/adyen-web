import { mount } from 'enzyme';
import { h } from 'preact';
import StateField from './StateField';
import getDataset from '../../../../core/Services/get-dataset';
import Specifications from '../Specifications';
import { mock } from 'jest-mock-extended';
import { StateFieldProps } from '../types';

jest.mock('../../../../core/Services/get-dataset');
const statesMock = [
    {
        id: 'CA',
        name: 'California'
    },
    {
        id: 'NY',
        name: 'New York'
    }
];

(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(statesMock)));

describe.skip('StateField', () => {
    const mockedProps = mock<StateFieldProps>();
    const getWrapper = (props = {}) => mount(<StateField specifications={new Specifications()} {...props} {...mockedProps} />);

    test('does not call getDataset when no country is passed', () => {
        getWrapper();
        expect(getDataset).not.toHaveBeenCalled();
    });

    test('does not call getDataset when a country with no states dataset is passed', () => {
        getWrapper({ selectedCountry: 'AR' });
        expect(getDataset).not.toHaveBeenCalled();
    });

    test('calls getDataset when a country with states dataset is passed', () => {
        getWrapper({ selectedCountry: 'US' });
        expect(getDataset).toHaveBeenCalled();
    });

    test('loads states', async () => {
        const wrapper = await getWrapper({ selectedCountry: 'US' });
        wrapper.update(null);
        expect(wrapper.find('li[data-value]')).toHaveLength(2);
    });

    test('preselects the passed state', async () => {
        const value = 'CA';
        const wrapper = await getWrapper({ selectedCountry: 'US', value });
        wrapper.update(null);
        // TODO: This test should be migrated to react test library instead of reading form props
        expect(wrapper.find('Select').prop('selectedValue')).toBe(value);
    });

    test('should not load the dropdown if no states were loaded', async () => {
        const wrapper = getWrapper({ selectedCountry: 'AR' });
        expect(wrapper.find('Select')).toHaveLength(0);
    });
});
