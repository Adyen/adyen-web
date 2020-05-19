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

    test('prefills the data', () => {
        const data = {
            street: 'Infinite Loop',
            postalCode: '95014',
            city: 'Cupertino',
            houseNumberOrName: '1',
            country: 'US',
            stateOrProvince: 'CA'
        };

        const wrapper = getWrapper({ data });
        expect(wrapper.find('InputText[name="street"]').prop('value')).toBe(data.street);
        expect(wrapper.find('InputText[name="postalCode"]').prop('value')).toBe(data.postalCode);
        expect(wrapper.find('InputText[name="city"]').prop('value')).toBe(data.city);
        expect(wrapper.find('InputText[name="houseNumberOrName"]').prop('value')).toBe(data.houseNumberOrName);
        expect(wrapper.find('CountryField').prop('value')).toBe(data.country);
        expect(wrapper.find('StateField').prop('value')).toBe(data.stateOrProvince);
    });
});
