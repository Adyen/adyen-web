import { h } from 'preact';
import Address from './Address';
import getDataset from '../../../core/Services/get-dataset';
import { AddressSpecifications } from './types';
import { AddressData } from '../../../types';
import { FALLBACK_VALUE } from './constants';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { countrySpecificFormatters } from './validate.formats';

jest.mock('../../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(
    jest.fn(() =>
        Promise.resolve([
            { id: 'NL', name: 'Netherlands' },
            {
                id: 'US',
                name: 'United States'
            },
            {
                id: 'CA',
                name: 'Canada'
            },
            {
                id: 'GB',
                name: 'United Kingdom'
            },
            {
                id: 'BR',
                name: 'Brazil'
            },
            {
                id: 'PL',
                name: 'Poland'
            },
            {
                id: 'PT',
                name: 'Portugal'
            }
        ])
    )
);

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
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                {ui}
            </CoreProvider>
        );
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should have the required fields', async () => {
        const requiredFields = ['street', 'houseNumberOrName', 'postalCode', 'country'];

        customRender(<Address specifications={addressSpecificationsMock} requiredFields={requiredFields} />);

        expect(screen.getByLabelText('Street')).toBeInTheDocument();
        expect(screen.getByLabelText('House number')).toBeInTheDocument();
        expect(screen.getByLabelText('Postal code')).toBeInTheDocument();
        expect(await screen.findByLabelText('Country/Region')).toBeInTheDocument();
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

    describe('With predefined country specific rules', () => {
        test('should show error when switching from country that has valid postal code to one that has invalid postal code', async () => {
            const user = userEvent.setup();
            const allowedCountries = Object.keys(countrySpecificFormatters);
            const countryCode = 'US';
            const data: AddressData = {
                postalCode: '95014',
                country: 'US'
            };
            const onChangeMock = jest.fn();
            customRender(
                <Address
                    countryCode={countryCode}
                    data={data}
                    specifications={addressSpecificationsMock}
                    allowedCountries={allowedCountries}
                    onChange={onChangeMock}
                />
            );
            const countryDropdown = await screen.findByRole('combobox', { name: /country/i });
            // Valid on init
            const lastOnChangeCall = onChangeMock.mock.calls.pop();
            expect(lastOnChangeCall[0].isValid).toBe(true);

            await user.click(countryDropdown);
            const newCountry = 'Canada';
            await user.type(countryDropdown, `${newCountry}[Enter]`);
            const errorMsg = await screen.findByText(/Invalid format. Expected format: A9A 9A9 or A9A9A9/);
            expect(errorMsg).toBeInTheDocument();
        });

        test('should show error when remove focus from postal code with invalid value', async () => {
            const user = userEvent.setup();
            const allowedCountries = Object.keys(countrySpecificFormatters);
            const countryCode = 'US';
            const data: AddressData = {
                country: 'US'
            };
            const onChangeMock = jest.fn();
            customRender(<Address countryCode={countryCode} data={data} allowedCountries={allowedCountries} onChange={onChangeMock} />);
            const postCode = await screen.findByRole('textbox', { name: /Zip code/ });
            await user.type(postCode, '1');
            await user.tab();
            const errorMsg = await screen.findByText(/Invalid format. Expected format: 99999 or 99999-9999/);
            expect(errorMsg).toBeInTheDocument();
        });

        describe.each`
            countryCode | raw                | expected
            ${'US'}     | ${'1234599999999'} | ${'12345'}
            ${'BR'}     | ${'12345678999'}   | ${'12345678'}
            ${'GB'}     | ${'AA99&9AA'}      | ${'AA999AA'}
            ${'PL'}     | ${'99-99999999'}   | ${'99-999'}
            ${'PT'}     | ${'1234AAAA567'}   | ${'1234567'}
        `('Format post code for specific countries', ({ countryCode, raw, expected }) => {
            it(`should format post code for ${countryCode}`, async () => {
                const allowedCountries = Object.keys(countrySpecificFormatters);
                const data: AddressData = {
                    postalCode: raw,
                    country: countryCode
                };
                const onChangeMock = jest.fn();
                customRender(<Address countryCode={countryCode} data={data} allowedCountries={allowedCountries} onChange={onChangeMock} />);
                const postCode = await screen.findByRole('textbox', { name: /code/ });
                expect(postCode).toHaveValue(expected);
            });
        });

        test("should show proper 'Zip Code' label for US", async () => {
            const allowedCountries = Object.keys(countrySpecificFormatters);
            const countryCode = 'US';
            const data: AddressData = {
                postalCode: '95014',
                country: 'US'
            };
            const onChangeMock = jest.fn();
            customRender(<Address countryCode={countryCode} data={data} allowedCountries={allowedCountries} onChange={onChangeMock} />);
            expect(await screen.findByRole('textbox', { name: /Zip code/ })).toBeInTheDocument();
        });
    });
});
