import usePhonePrefixes from './usePhonePrefixes';
import getDataset from '../../../core/Services/get-dataset';
import { renderHook } from '@testing-library/preact-hooks';
import { waitFor } from '@testing-library/preact';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';

jest.mock('../../../core/Services/get-dataset');

describe('usePhonePrefixes', () => {
    const props = { allowedCountries: [], loadingContext: 'test', handleError: jest.fn() };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should return a list of phone prefixes', async () => {
        const datasetMock = [{ id: 'AF', prefix: '+93' }];
        (getDataset as jest.Mock).mockResolvedValue(datasetMock);

        const { result } = renderHook(() => usePhonePrefixes(props));
        const expectedPrefixes = datasetMock.map(item => ({
            id: item.prefix,
            name: `${item.prefix} (${item.id})`,
            selectedOptionName: item.prefix
        }));
        await waitFor(() => expect(result.current).toEqual({ loadingStatus: 'ready', phonePrefixes: expectedPrefixes }));
    });

    test('should return a list of phone prefixes for allowedCountries', async () => {
        const datasetMock = [
            { id: 'AF', prefix: '+93' },
            { id: 'TEST', prefix: '+00' }
        ];
        (getDataset as jest.Mock).mockResolvedValue(datasetMock);

        const { result } = renderHook(() => usePhonePrefixes({ ...props, allowedCountries: ['AF'] }));
        const expectedPrefixes = [
            {
                id: datasetMock[0].prefix,
                name: `${datasetMock[0].prefix} (${datasetMock[0].id})`,
                selectedOptionName: `${datasetMock[0].prefix}`
            }
        ];
        await waitFor(() => expect(result.current).toEqual({ loadingStatus: 'ready', phonePrefixes: expectedPrefixes }));
    });

    test('should return an empty array when getDataset failed', async () => {
        (getDataset as jest.Mock).mockRejectedValue([]);

        const { result } = renderHook(() => usePhonePrefixes(props));
        await waitFor(() => expect(result.current).toEqual({ loadingStatus: 'ready', phonePrefixes: [] }));
        expect(props.handleError).toHaveBeenCalledWith(new AdyenCheckoutError('ERROR'));
    });
});
