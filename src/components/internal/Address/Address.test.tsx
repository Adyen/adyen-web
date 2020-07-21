import { shallow } from 'enzyme';
import { h } from 'preact';
import Address from './Address';

describe('Address', () => {
    const i18n = { get: key => key };
    const getWrapper = props => shallow(<Address i18n={i18n} {...props} />);

    test('has the required fields', () => {
        const requiredFields = ['street', 'houseNumberOrName', 'postalCode', 'country'];
        const wrapper = getWrapper({ requiredFields });
        expect(wrapper.find('InputText[name="street"]')).toHaveLength(1);
        expect(wrapper.find('InputText[name="houseNumberOrName"]')).toHaveLength(1);
        expect(wrapper.find('InputText[name="postalCode"]')).toHaveLength(1);
        expect(wrapper.find('InputText[name="city"]')).toHaveLength(0);
        expect(wrapper.find('CountryField')).toHaveLength(1);
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
        wrapper.update();

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
            country: 'NL',
        };

        const onChangeMock = jest.fn();
        getWrapper({ data, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('sets not required fields as "N/A" except for the ones that are passed in the data object', () => {
        const requiredFields = ['street'];

        const data = {
            country: 'NL'
        };

        const onChangeMock = jest.fn();
        getWrapper({ data, requiredFields, onChange: onChangeMock });
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].data.street).toBe('');
        expect(lastOnChangeCall[0].data.postalCode).toBe('N/A');
        expect(lastOnChangeCall[0].data.country).toBe(data.country);
    });

    test('sets the stateOrProvince field to "N/A" for countries with no state dataset', () => {
        const data = {
            country: 'NL'
        };

        const wrapper = getWrapper({ data });
        expect(wrapper.find('StateField').prop('value')).toBe('N/A');
    });

    test('sets the stateOrProvince field as an empty string for countries with a state dataset', () => {
        const data = {
            country: 'US'
        };

        const wrapper = getWrapper({ data });
        expect(wrapper.find('StateField').prop('value')).toBe('');
    });
});
