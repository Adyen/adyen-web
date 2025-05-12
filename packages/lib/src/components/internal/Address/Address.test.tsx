import { shallow } from 'enzyme';
import { h } from 'preact';
import Address from './Address';
import getDataset from '../../../core/Services/get-dataset';
import { AddressSchema, AddressSpecifications } from './types';
import { AddressData } from '../../../types';
import { FALLBACK_VALUE } from './constants';

jest.mock('../../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve({})));

describe('Address', () => {
    const addressSpecificationsMock: AddressSpecifications = {
        US: {
            hasDataset: true,
            schema: ['country', 'postalCode']
        },
        default: {
            schema: ['country', 'street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince']
        }
    };
    const getWrapper = props => shallow(<Address specifications={addressSpecificationsMock} {...props} />);

    test('has the required fields', () => {
        const requiredFields: AddressSchema = ['street', 'houseNumberOrName', 'postalCode', 'country'];
        const wrapper = getWrapper({ requiredFields });
        expect(wrapper.find('FieldContainer')).toHaveLength(requiredFields.length);
    });

    test('shows the address as readOnly', () => {
        const requiredFields: AddressSchema = ['street', 'houseNumberOrName', 'postalCode', 'country'];
        const visibility = 'readOnly';
        const wrapper = getWrapper({ requiredFields, visibility });
        expect(wrapper.find('ReadOnlyAddress')).toHaveLength(1);
    });

    test('prefills the address fields from the passed data object', () => {
        const data: AddressData = {
            street: 'Infinite Loop',
            postalCode: '95014',
            city: 'Cupertino',
            houseNumberOrName: '1',
            country: 'NL',
            stateOrProvince: 'CA'
        };

        const onChangeMock = jest.fn();
        const wrapper = getWrapper({ data, onChange: onChangeMock });
        wrapper.update(null);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].data).toMatchObject(data);
    });

    test('validates prefilled data', () => {
        const data: AddressData = {
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

    test('validates prefilled data correctly when a field is optional', () => {
        const data: AddressData = {
            street: '1 Infinite Loop',
            postalCode: '95014',
            city: 'Cupertino',
            country: 'US',
            stateOrProvince: 'CA'
        };
        const specifications: AddressSpecifications = {
            US: { optionalFields: ['houseNumberOrName'] }
        };

        const onChangeMock = jest.fn();
        getWrapper({ data, specifications, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('validates prefilled data correctly when a country with no state or province field is used', () => {
        const data: AddressData = {
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
        const requiredFields: AddressSchema = ['street'];
        const data = { country: 'NL' };
        const onChangeMock = jest.fn();

        getWrapper({ data, requiredFields, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        expect(receivedData.street).toBe(undefined);
        expect(receivedData.postalCode).toBe(FALLBACK_VALUE);
        expect(receivedData.city).toBe(FALLBACK_VALUE);
        expect(receivedData.houseNumberOrName).toBe(FALLBACK_VALUE);
        expect(receivedData.country).toBe(data.country);
    });

    test('sets optional fields as "N/A" if no data is set', () => {
        const data: AddressData = {
            street: '1 Infinite Loop',
            postalCode: '95014',
            country: 'US',
            stateOrProvince: 'CA'
        };
        const specifications: AddressSpecifications = {
            US: { optionalFields: ['houseNumberOrName', 'postalCode'] }
        };
        const onChangeMock = jest.fn();
        getWrapper({ data, specifications, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        expect(receivedData.street).toBe(data.street);
        expect(receivedData.postalCode).toBe(data.postalCode);
        expect(receivedData.city).toBe(undefined);
        expect(receivedData.houseNumberOrName).toBe(FALLBACK_VALUE);
        expect(receivedData.country).toBe(data.country);
    });

    test('does not include fields without a value in the data object', () => {
        const data: AddressData = { country: 'NL' };
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
        const data: AddressData = { country: 'NL' };
        const onChangeMock = jest.fn();
        const wrapper = getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        wrapper.update(null);
        expect(receivedData.stateOrProvince).toBe(FALLBACK_VALUE);
    });

    test('removes the stateOrProvince field for countries with a state dataset', () => {
        const data: AddressData = { country: 'US' };
        const onChangeMock = jest.fn();
        const wrapper = getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        wrapper.update(null);
        expect(receivedData.stateOrProvince).toBe(undefined);
    });

    test('does not include fields if they are not part of valid schema fields', () => {
        const data = {
            street: '1 Infinite Loop',
            postalCode: '95014',
            country: 'NL',
            stateOrProvince: 'CA',
            firstName: 'dummy',
            invalidField: 'dummy'
        };

        const onChangeMock = jest.fn();
        getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        expect(receivedData.street).toBe(data.street);
        expect(receivedData.postalCode).toBe(data.postalCode);
        expect(receivedData.country).toBe(data.country);
        expect(receivedData.stateOrProvince).toBe(data.stateOrProvince);
        expect(receivedData.firstName).toBe(undefined);
        expect(receivedData.invalidField).toBe(undefined);
    });
});
