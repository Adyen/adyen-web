import { h } from 'preact';
import Address from './Address';
import getDataset from '../../../core/Services/get-dataset';
import { AddressSpecifications } from './types';
import { AddressData } from '../../../types';
import { FALLBACK_VALUE } from './constants';
import { render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import userEvent from '@testing-library/user-event';

jest.mock('../../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(
    jest.fn(dataset => {
        switch (dataset) {
            case 'countries':
                return Promise.resolve([
                    { id: 'US', name: 'United States' },
                    { id: 'CA', name: 'Canada' },
                    { id: 'NL', name: 'Netherlands' }
                ]);
            case 'states/US':
                return Promise.resolve([
                    { id: 'AR', name: 'Arkansas' },
                    { id: 'CA', name: 'California' }
                ]);
            case 'states/CA':
                return Promise.resolve([
                    { id: 'AB', name: 'Alberta' },
                    { id: 'BC', name: 'British Columbia' }
                ]);
        }
    })
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

    // const getWrapper = props => shallow(<Address specifications={addressSpecificationsMock} {...props} />);

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

    test('should not include fields without a value in the data object', () => {
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

    describe('Country and State or Province', () => {
        const user = userEvent.setup();
        const onChangeMock = jest.fn();
        test('should set the stateOrProvince value to empty and show options when country changes', async () => {
            const data: AddressData = { country: 'US' };

            customRender(<Address countryCode={'US'} data={data} onChange={onChangeMock} />);

            const countrySearch = await screen.findByLabelText('Country/Region');
            await user.click(countrySearch);
            // write in the searchbar
            await user.keyboard('Canada');
            // select one option
            await user.keyboard('[ArrowDown][Enter]');
            const stateSearch = await screen.findByLabelText('Province or Territory');
            expect(stateSearch).toBeInTheDocument();
            // open the state selector
            await user.click(stateSearch);
            // check if options are avaliable
            expect(screen.getByText('Alberta')).toBeVisible();
        });

        test('should reset the stateOrProvince value when country changes', async () => {
            const data: AddressData = { country: 'US', stateOrProvince: 'CA' };

            customRender(<Address countryCode={'US'} data={data} onChange={onChangeMock} />);

            // check if US values for state or province are set
            expect(await screen.findByDisplayValue('United States')).toBeVisible();
            expect(await screen.findByDisplayValue('California')).toBeVisible();

            // search for CountryLabel and region, choose Canada
            const countrySearch = await screen.findByLabelText('Country/Region');
            await user.click(countrySearch);
            // write in the searchbar
            await user.keyboard('Canada');
            // select one option
            await user.keyboard('[ArrowDown][Enter]');

            // Check if the state has reset to empty value
            const stateSearch = await screen.findByLabelText('Province or Territory');
            expect(stateSearch).toBeInTheDocument();
            expect(stateSearch).toHaveValue('');
        });

        test('should trigger postal code validation on country change and show error message', async () => {
            const data: AddressData = { country: 'US', stateOrProvince: 'CA', postalCode: '90000' };

            customRender(<Address countryCode={'US'} data={data} onChange={onChangeMock} />);

            // search for CountryLabel and region, choose Canada
            const countrySearch = await screen.findByLabelText('Country/Region');
            await user.click(countrySearch);
            // write in the searchbar
            await user.keyboard('Canada');
            // select one option
            await user.keyboard('[ArrowDown][Enter]');

            // Check if the state has reset to empty value
            const postalCodeField = await screen.findByRole('textbox', { name: 'Postal code' });
            expect(postalCodeField).toBeInTheDocument();
            expect(postalCodeField).toHaveValue('90000');
            expect(screen.getByText('Invalid format. Expected format: A9A 9A9 or A9A9A9')).toBeVisible();
        });
    });

    describe('AddressSearch in Address', () => {
        // 0. delay the test since it rellies on user input
        // there's probably a performance optimisation here, but delay was the simples and most reliable way to fix it
        const user = userEvent.setup({ delay: 100 });
        const onChangeMock = jest.fn();

        test('should fill the stateOrProvince field for countries who support state', async () => {
            const data: AddressData = {};

            // 1. setup the test
            // 1a. create mock for this tests
            const addressMock = {
                id: 1,
                name: '1000 Test Road, California',
                street: '1000 Test Road',
                city: 'Los Santos',
                //houseNumberOrName: '',
                postalCode: '90000',
                country: 'US',
                stateOrProvince: 'CA'
            };

            // 1b. pass the mock to the the mock functions so we get it as the search result
            const onAdressSearchMock = jest.fn(async (value, { resolve }) => {
                await resolve([addressMock]);
            });
            const onAddressSelectedMock = jest.fn(async (value, { resolve }) => {
                await resolve(addressMock);
            });

            // 2. render and intereact
            customRender(
                <Address data={data} onChange={onChangeMock} onAddressLookup={onAdressSearchMock} onAddressSelected={onAddressSelectedMock} />
            );
            const searchBar = screen.getByRole('combobox');
            await user.click(searchBar);
            // write in the searchbar
            await user.keyboard('mock');
            // select one option
            await user.keyboard('[ArrowDown][Enter]');

            // 3. check filled values are correct
            expect(screen.getByDisplayValue('1000 Test Road')).toBeInTheDocument();
            expect(screen.getByDisplayValue('90000')).toBeInTheDocument();
            expect(screen.getByDisplayValue('California')).toBeInTheDocument();
        });

        test('should fill the stateOrProvince field for countries who support state', async () => {
            const data: AddressData = { country: 'CA' };

            // 1. setup the test
            // 1a. create mock for this tests
            const addressMock = {
                id: 1,
                name: '1000 Test Road, California',
                street: '1000 Test Road',
                city: 'Los Santos',
                //houseNumberOrName: '',
                postalCode: '90000',
                country: 'US',
                stateOrProvince: 'CA'
            };

            // 1b. pass the mock to the the mock functions so we get it as the search result
            const onAdressSearchMock = jest.fn(async (value, { resolve }) => {
                await resolve([addressMock]);
            });
            const onAddressSelectedMock = jest.fn(async (value, { resolve }) => {
                await resolve(addressMock);
            });

            // 2. render and intereact
            customRender(
                <Address data={data} onChange={onChangeMock} onAddressLookup={onAdressSearchMock} onAddressSelected={onAddressSelectedMock} />
            );
            const searchBar = screen.getByRole('combobox');
            await user.click(searchBar);
            // write in the searchbar
            await user.keyboard('mock');
            // select one option
            await user.keyboard('[ArrowDown][Enter]');

            // 3. check filled values are correct
            expect(screen.getByDisplayValue('1000 Test Road')).toBeInTheDocument();
            expect(screen.getByDisplayValue('90000')).toBeInTheDocument();
            expect(screen.getByDisplayValue('California')).toBeInTheDocument();
        });

        test('should trigger field validation after address is selected', async () => {
            const data: AddressData = {};

            // 1. setup the test
            // 1a. create mock for this tests
            const incorrectPostalCodeAddressMock = {
                id: 1,
                name: '1000 Test Road, California',
                street: '1000 Test Road',
                city: 'Los Santos',
                //houseNumberOrName: '',
                postalCode: '9000 AA',
                country: 'US',
                stateOrProvince: 'CA'
            };

            // 1b. pass the mock to the the mock functions so we get it as the search result
            const onAdressSearchMock = jest.fn(async (value, { resolve }) => {
                await resolve([incorrectPostalCodeAddressMock]);
            });
            const onAddressSelectedMock = jest.fn(async (value, { resolve }) => {
                await resolve(incorrectPostalCodeAddressMock);
            });

            // 2. render and intereact
            customRender(
                <Address data={data} onChange={onChangeMock} onAddressLookup={onAdressSearchMock} onAddressSelected={onAddressSelectedMock} />
            );
            const searchBar = screen.getByRole('combobox');
            await user.click(searchBar);
            // write in the searchbar
            await user.keyboard('mock');
            // select one option
            await user.keyboard('[ArrowDown][Enter]');

            // 3. check filled values are correct and error state is triggered
            expect(screen.getByRole('textbox', { name: 'Zip code' })).toHaveValue('9000 AA');
            expect(screen.getByText('Invalid format. Expected format: 99999 or 99999-9999')).toBeVisible();
        });
    });
});
