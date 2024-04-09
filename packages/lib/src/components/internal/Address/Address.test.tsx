import { h } from 'preact';
import Address from './Address';
import getDataset from '../../../core/Services/get-dataset';
import { AddressSpecifications } from './types';
import { AddressData } from '../../../types';
import { FALLBACK_VALUE } from './constants';
import { render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { Resources } from '../../../core/Context/Resources';

jest.mock('../../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve([{ id: 'NL', name: 'Netherlands' }])));

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

    const customRender = ui => {
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={new Resources()}>
                {ui}
            </CoreProvider>
        );
    };

    // const getWrapper = props => shallow(<Address specifications={addressSpecificationsMock} {...props} />);

    test('should have the required fields', async () => {
        const requiredFields = ['street', 'houseNumberOrName', 'postalCode', 'country'];

        customRender(<Address specifications={addressSpecificationsMock} requiredFields={requiredFields} />);

        expect(screen.getByLabelText('Street')).toBeInTheDocument();
        expect(screen.getByLabelText('House number')).toBeInTheDocument();
        expect(screen.getByLabelText('Postal code')).toBeInTheDocument();
        expect(await screen.findByLabelText('Country')).toBeInTheDocument();
    });

    test('should show the address as readOnly', () => {
        const requiredFields = ['street', 'houseNumberOrName', 'postalCode', 'country'];

        customRender(
            <Address
                data={{ street: 'Simon Carmiggeltstraat 6-50' }}
                specifications={addressSpecificationsMock}
                requiredFields={requiredFields}
                visibility="readOnly"
            />
        );

        expect(screen.getByText('Simon Carmiggeltstraat 6-50')).toBeInTheDocument();
    });

    test('should prefill the address fields from the passed data object', () => {
        const data: AddressData = {
            street: 'Infinite Loop',
            postalCode: '95014',
            city: 'Cupertino',
            houseNumberOrName: '1',
            country: 'US',
            stateOrProvince: 'CA'
        };
        const onChangeMock = jest.fn();
        customRender(<Address data={data} specifications={addressSpecificationsMock} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].data).toMatchObject(data);
    });

    test('should validate prefilled data', () => {
        const data: AddressData = {
            street: 'Infinite Loop',
            postalCode: '95014',
            city: 'Cupertino',
            houseNumberOrName: '1',
            country: 'US',
            stateOrProvince: 'CA'
        };

        const onChangeMock = jest.fn();
        customRender(<Address data={data} specifications={addressSpecificationsMock} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('should validate prefilled data correctly when a field is optional', () => {
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
        customRender(<Address data={data} specifications={specifications} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('should validate prefilled data correctly when a country with no state or province field is used', () => {
        const data: AddressData = {
            street: 'Simon Carmiggeltstraat',
            postalCode: '1011DJ',
            city: 'Amsterdam',
            houseNumberOrName: '6-50',
            country: 'NL'
        };

        const onChangeMock = jest.fn();
        customRender(<Address data={data} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('should set not required fields as "N/A" except for the ones that are passed in the data object', () => {
        const requiredFields = ['street'];
        const data = { country: 'NL' };
        const onChangeMock = jest.fn();

        customRender(<Address data={data} requiredFields={requiredFields} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;

        expect(receivedData.street).toBe(undefined);
        expect(receivedData.postalCode).toBe(FALLBACK_VALUE);
        expect(receivedData.city).toBe(FALLBACK_VALUE);
        expect(receivedData.houseNumberOrName).toBe(FALLBACK_VALUE);
        expect(receivedData.country).toBe(data.country);
    });

    test('should set optional fields as "N/A" if no data is set', () => {
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

        customRender(<Address data={data} specifications={specifications} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        expect(receivedData.street).toBe(data.street);
        expect(receivedData.postalCode).toBe(data.postalCode);
        expect(receivedData.city).toBe(undefined);
        expect(receivedData.houseNumberOrName).toBe(FALLBACK_VALUE);
        expect(receivedData.country).toBe(data.country);
    });

    test('should  not include fields without a value in the data object', () => {
        const data: AddressData = { country: 'NL' };
        const onChangeMock = jest.fn();

        customRender(<Address data={data} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;

        expect(receivedData.street).toBe(undefined);
        expect(receivedData.postalCode).toBe(undefined);
        expect(receivedData.city).toBe(undefined);
        expect(receivedData.houseNumberOrName).toBe(undefined);
        expect(receivedData.country).toBe(data.country);
    });

    test('should set the stateOrProvince field to "N/A" for countries with no state dataset', () => {
        const data: AddressData = { country: 'NL' };
        const onChangeMock = jest.fn();

        customRender(<Address data={data} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;

        expect(receivedData.stateOrProvince).toBe(FALLBACK_VALUE);
    });

    test('should remove the stateOrProvince field for countries with a state dataset', () => {
        const data: AddressData = { country: 'US' };
        const onChangeMock = jest.fn();

        customRender(<Address data={data} onChange={onChangeMock} />);

        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        const receivedData = lastOnChangeCall[0].data;
        expect(receivedData.stateOrProvince).toBe(undefined);
    });
});
