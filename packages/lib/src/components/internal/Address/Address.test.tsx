import { shallow } from 'enzyme';
import { h } from 'preact';
import Address from './Address';
import getDataset from '../../../utils/fetch-json-data';

jest.mock('../../../utils/fetch-json-data');
(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve({})));

describe('Address', () => {
    const getWrapper = props => shallow(<Address {...props} />);

    test('has the required fields', () => {
        const requiredFields = ['street', 'houseNumberOrName', 'postalCode', 'country'];
        const wrapper = getWrapper({ requiredFields });
        expect(wrapper.find('FieldContainer')).toHaveLength(requiredFields.length);
    });

    test('shows the address as readOnly', () => {
        const requiredFields = ['street', 'houseNumberOrName', 'postalCode', 'country'];
        const visibility = 'readOnly';
        const wrapper = getWrapper({ requiredFields, visibility });
        expect(wrapper.find('ReadOnlyAddress')).toHaveLength(1);
    });

    test('prefills the address fields from the passed data object', () => {
        const data = {
            street: 'Infinite Loop',
            postalCode: '95014',
            city: 'Cupertino',
            houseNumberOrName: '1',
            country: 'US',
            stateOrProvince: 'CA'
        };

        const onChangeMock = jest.fn();
        const wrapper = getWrapper({ data, onChange: onChangeMock });
        wrapper.update(null);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].data).toMatchObject(data);
    });

    test('validates prefilled data', () => {
        const data = {
            street: 'Infinite Loop',
            postalCode: '95014',
            city: 'Cupertino',
            houseNumberOrName: '1',
            country: 'US',
            stateOrProvince: 'CA'
        };

        const onChangeMock = jest.fn();
        getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('validates prefilled data correctly when a country with no state or province field is used', () => {
        const data = {
            street: 'Simon Carmiggeltstraat',
            postalCode: '1011DJ',
            city: 'Amsterdam',
            houseNumberOrName: '6-50',
            country: 'NL'
        };

        const onChangeMock = jest.fn();
        getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('sets not required fields as "N/A" except for the ones that are passed in the data object', () => {
        const requiredFields = ['street'];
        const data = { country: 'NL' };
        const onChangeMock = jest.fn();

        getWrapper({ data, requiredFields, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        expect(receivedData.street).toBe(undefined);
        expect(receivedData.postalCode).toBe('N/A');
        expect(receivedData.city).toBe('N/A');
        expect(receivedData.houseNumberOrName).toBe('N/A');
        expect(receivedData.country).toBe(data.country);
    });

    test('does not include fields without a value in the data object', () => {
        const data = { country: 'NL' };
        const onChangeMock = jest.fn();

        getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;

        expect(receivedData.street).toBe(undefined);
        expect(receivedData.postalCode).toBe(undefined);
        expect(receivedData.city).toBe(undefined);
        expect(receivedData.houseNumberOrName).toBe(undefined);
        expect(receivedData.country).toBe(data.country);
    });

    test('sets the stateOrProvince field to "N/A" for countries with no state dataset', () => {
        const data = { country: 'NL' };
        const onChangeMock = jest.fn();
        const wrapper = getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        wrapper.update(null);
        expect(receivedData.stateOrProvince).toBe('N/A');
    });

    test('sets the stateOrProvince field as an empty string for countries with a state dataset', () => {
        const data = { country: 'US' };
        const onChangeMock = jest.fn();
        const wrapper = getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        wrapper.update(null);
        expect(receivedData.stateOrProvince).toBe('');
    });
});
