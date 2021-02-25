import { mount } from 'enzyme';
import { h } from 'preact';
import CountryField from './CountryField';
import getDataset from '../../../../core/Services/get-dataset';

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

describe('CountryField', () => {
    const getWrapper = (props?) => mount(<CountryField {...props} />);

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
        expect(wrapper.find('Select').prop('selected')).toBe(value);
    });

    test('should be read only if there is only one item', async () => {
        const allowedCountries = ['NL'];
        const value = 'NL';
        const wrapper = await getWrapper({ value, allowedCountries });
        wrapper.update(null);
        expect(wrapper.find('Select').prop('readonly')).toBe(true);
    });
});
