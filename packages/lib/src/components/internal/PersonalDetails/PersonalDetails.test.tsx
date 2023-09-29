import { h } from 'preact';
import { mount } from 'enzyme';
import PersonalDetails from './PersonalDetails';
import CoreProvider from '../../../core/Context/CoreProvider';

const getWrapper = (props = {}) => {
    return mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <PersonalDetails {...props} />
        </CoreProvider>
    );
};

describe('PersonalDetails', () => {
    test('has the required fields', () => {
        const requiredFields = ['firstName', 'lastName', 'telephoneNumber'];
        const wrapper = getWrapper({ requiredFields });
        expect(wrapper.find('InputText[name="firstName"]')).toHaveLength(1);
        expect(wrapper.find('InputText[name="lastName"]')).toHaveLength(1);
        expect(wrapper.find('InputTelephone[name="telephoneNumber"]')).toHaveLength(1);
        expect(wrapper.find('InputEmail[name="shopperEmail"]')).toHaveLength(0);
    });

    test('shows the PersonalDetails as readOnly', () => {
        const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'telephoneNumber', 'shopperEmail'];
        const visibility = 'readOnly';
        const wrapper = getWrapper({ requiredFields, visibility });
        expect(wrapper.find('ReadOnlyPersonalDetails')).toHaveLength(1);
    });

    test('prefills the data', () => {
        const data = {
            firstName: 'John',
            lastName: 'Smith',
            gender: 'MALE',
            dateOfBirth: '1990-01-01',
            telephoneNumber: '0610001122',
            shopperEmail: 'shopper@email.com'
        };

        const wrapper = getWrapper({ data });
        expect(wrapper.find('InputText[name="firstName"]').prop('value')).toBe(data.firstName);
        expect(wrapper.find('InputText[name="lastName"]').prop('value')).toBe(data.lastName);
        expect(wrapper.find('RadioGroup[name="gender"]').prop('value')).toBe(data.gender);
        expect(wrapper.find('InputDate[name="dateOfBirth"]').prop('value')).toBe(data.dateOfBirth);
        expect(wrapper.find('InputTelephone[name="telephoneNumber"]').prop('value')).toBe(data.telephoneNumber);
        expect(wrapper.find('InputEmail[name="shopperEmail"]').prop('value')).toBe(data.shopperEmail);
    });

    test('returns the data in the expected format', () => {
        const data = {
            firstName: 'John',
            lastName: 'Smith',
            gender: 'MALE',
            dateOfBirth: '1990-01-01',
            telephoneNumber: '0610001122',
            shopperEmail: 'shopper@email.com'
        };

        const onChange = jest.fn();
        getWrapper({ data, onChange });
        const formattedData = onChange.mock.calls[onChange.mock.calls.length - 1][0].data;

        expect(formattedData.firstName).toBe(undefined);
        expect(formattedData.firstName).toBe(undefined);
        expect(formattedData.gender).toBe(undefined);
        expect(formattedData.shopperName.firstName).toBe(data.firstName);
        expect(formattedData.shopperName.firstName).toBe(data.firstName);
        expect(formattedData.shopperName.gender).toBe(data.gender);
        expect(formattedData.dateOfBirth).toBe(data.dateOfBirth);
        expect(formattedData.telephoneNumber).toBe(data.telephoneNumber);
        expect(formattedData.shopperEmail).toBe(data.shopperEmail);
    });
});
