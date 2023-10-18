import { mount } from 'enzyme';
import { h } from 'preact';
import CountryField from './CountryField';
import getDataset from '../../../../core/Services/get-dataset';
import { mock } from 'jest-mock-extended';
import { CountryFieldProps } from '../types';
import CoreProvider from '../../../../core/Context/CoreProvider';

jest.mock('../../../../core/Services/get-dataset');
const countriesMock = [
    {
        id: 'NL',
        name: 'Netherlands'
    },
    {
        id: 'SG',
        name: 'Singapore'
    },
    {
        id: 'US',
        name: 'United States'
    }
];

(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(countriesMock)));
const countryFieldPropsMock = mock<CountryFieldProps>();

const getWrapper = (props = {}) => {
    return mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <CountryField {...props} {...countryFieldPropsMock} />
        </CoreProvider>
    );
};

describe('CountryField', () => {
    test('calls getDataset', () => {
        getWrapper();
        expect(getDataset).toHaveBeenCalled();
    });

    test('loads countries', async () => {
        const wrapper = await getWrapper();
        const countriesLength = Object.keys(countriesMock).length;
        wrapper.update(null);
        expect(wrapper.find('li[data-value]')).toHaveLength(countriesLength);
    });

    test('only loads the allowed countries ', async () => {
        const allowedCountries = ['US', 'NL'];
        const wrapper = await getWrapper({ allowedCountries });
        wrapper.update(null);
        expect(wrapper.find('li[data-value]')).toHaveLength(allowedCountries.length);
    });

    test('preselects the passed country', async () => {
        const value = 'NL';
        const wrapper = await getWrapper({ value });
        wrapper.update(null);
        // TODO: This test should be migrated to react test library instead of reading form props
        expect(wrapper.find('Select').prop('selectedValue')).toBe(value);
    });

    test('should be read only if there is only one item', async () => {
        const allowedCountries = ['NL'];
        const value = 'NL';
        const wrapper = await getWrapper({ value, allowedCountries });
        wrapper.update(null);
        expect(wrapper.find('Select').prop('readonly')).toBe(true);
    });
});
