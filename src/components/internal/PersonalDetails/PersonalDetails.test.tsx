import { h } from 'preact';
import { shallow } from 'enzyme';
import PersonalDetails from './PersonalDetails';

describe('PersonalDetails', () => {
    const i18n = { get: key => key };
    const getWrapper = props => shallow(<PersonalDetails i18n={i18n} {...props} />);

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
});
