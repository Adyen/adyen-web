import { h } from 'preact';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/preact';
import AddressSearch from './AddressSearch';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

const ADDRESS_LOOKUP_RESULT = [
    {
        id: 1,
        name: 'Road 1, 2000, UK',
        street: 'Road 1'
    },
    {
        id: 2,
        name: 'Road 2, 2500, UK',
        street: 'Road 2'
    },
    {
        id: 3,
        name: 'Road 3, 3000, UK',
        street: 'Road 3'
    }
];

const customRender = (ui: h.JSX.Element) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );
};

const ADDRESS_SELECT_RESULT = {
    id: 1,
    name: 'Road 1, 2000, UK',
    street: 'Road 1',
    city: 'London',
    houseNumberOrName: '1',
    postalCode: '2000',
    country: 'GB',
    raw: {
        id: 1,
        raw: 'RAW_DATA_MOCK'
    }
};
const onAddressLookupMockFn = async (value, { resolve }) => {
    resolve(ADDRESS_LOOKUP_RESULT);
};
const onAddressSelectMockFn = async (value, { resolve }) => {
    resolve(ADDRESS_SELECT_RESULT);
};

const onAddressSelectMockFnReject =
    rejectReason =>
    async (value, { reject }) => {
        reject(rejectReason);
    };

test('onAddressLookupMock should be triggered when typing', async () => {
    const user = userEvent.setup({ delay: 100 });

    const onAddressLookupMock = jest.fn(onAddressLookupMockFn);

    customRender(
        <AddressSearch
            onSelect={() => {}}
            onManualAddress={() => {}}
            externalErrorMessage={'failed'}
            onAddressLookup={onAddressLookupMock}
            hideManualButton={true}
            addressSearchDebounceMs={0}
        />
    );

    // Helps to make sure all tests ran
    expect.assertions(5);

    // Get the input
    const searchBar = screen.getByRole('combobox');
    await user.click(searchBar);
    expect(searchBar).toHaveFocus();

    await user.keyboard('Test');
    expect(searchBar).toHaveValue('Test');

    // Test if onAddressLookup is called with the correct values
    await waitFor(() => expect(onAddressLookupMock).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(onAddressLookupMock.mock.lastCall[0]).toBe('Test'));
    // Test if the return of the function is displayed
    const resultList = screen.getByRole('listbox');
    expect(resultList).toHaveTextContent('Road 1, 2000, UK');
});

test('onSelect is triggered with correct data', async () => {
    const user = userEvent.setup({ delay: 100 });

    const onAddressLookupMock = jest.fn(onAddressLookupMockFn);
    const onAddressSelectMock = jest.fn(onAddressSelectMockFn);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const internalSetDataMock = jest.fn(data => {});

    customRender(
        <AddressSearch
            onSelect={internalSetDataMock}
            onManualAddress={() => {}}
            externalErrorMessage={'failed'}
            onAddressLookup={onAddressLookupMock}
            onAddressSelected={onAddressSelectMock}
            hideManualButton={true}
            addressSearchDebounceMs={0}
        />
    );
    const searchBar = screen.getByRole('combobox');

    await user.click(searchBar);
    await user.keyboard('Test');

    // Move down with the keyboard and select the first option
    await user.keyboard('[ArrowDown][Enter]');
    await waitFor(() => expect(onAddressSelectMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
        expect(onAddressSelectMock.mock.lastCall[0]).toStrictEqual({
            id: 1,
            name: 'Road 1, 2000, UK',
            street: 'Road 1'
        })
    );

    // CHeck if the parents select function is called with full data
    await waitFor(() => expect(internalSetDataMock.mock.lastCall[0]).toStrictEqual(ADDRESS_SELECT_RESULT));
});

test('rejecting onAddressLookupMock should not trigger error', async () => {
    const user = userEvent.setup({ delay: 100 });

    const onAddressLookupMock = jest.fn(onAddressSelectMockFnReject({}));

    customRender(
        <AddressSearch
            onSelect={() => {}}
            onManualAddress={() => {}}
            externalErrorMessage={'failed'}
            onAddressLookup={onAddressLookupMock}
            hideManualButton={true}
            addressSearchDebounceMs={0}
        />
    );

    // Helps to make sure all tests ran
    expect.assertions(3);

    // Get the input
    const searchBar = screen.getByRole('combobox');
    await user.click(searchBar);
    await user.keyboard('Test');

    // Still test if correct values are being called
    await waitFor(() => expect(onAddressLookupMock).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(onAddressLookupMock.mock.lastCall[0]).toBe('Test'));

    // Test if no options are displayed
    const resultList = screen.getByRole('listbox');
    expect(resultList).toHaveTextContent('No options found');

    // TODO fix this
    // const resultError = screen.getByText('failed');
    // expect(resultError).not.toBeVisible();
});

test('rejecting onAddressLookupMock with errorMessage displays error and message', async () => {
    const user = userEvent.setup({ delay: 100 });

    const onAddressLookupMock = jest.fn(onAddressSelectMockFnReject({ errorMessage: 'Refused Mock' }));

    customRender(
        <AddressSearch
            onSelect={() => {}}
            onManualAddress={() => {}}
            externalErrorMessage={'failed'}
            onAddressLookup={onAddressLookupMock}
            hideManualButton={true}
            addressSearchDebounceMs={0}
        />
    );

    // Helps to make sure all tests ran
    expect.assertions(3);

    // Get the input
    const searchBar = screen.getByRole('combobox');
    await user.click(searchBar);
    await user.keyboard('Test');

    await waitFor(() => expect(onAddressLookupMock).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(onAddressLookupMock.mock.lastCall[0]).toBe('Test'));

    // Test if no options are displayed
    const resultError = screen.getByText('Refused Mock');
    expect(resultError).toBeVisible();
});
