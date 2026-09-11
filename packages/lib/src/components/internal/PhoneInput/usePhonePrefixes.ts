import { useLayoutEffect, useState } from 'preact/hooks';
import getDataset from '../../../core/Services/get-dataset';
import { DataSet } from '../../../core/Services/data-set';
import { PhonePrefixDataSetItem, PhonePrefixes } from './types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';

function usePhonePrefixes({ allowedCountries, loadingContext, handleError }): PhonePrefixes {
    const [loadingStatus, setLoadingStatus] = useState<string>('loading');
    const [phonePrefixes, setPhonePrefixes] = useState<DataSet>([]);

    useLayoutEffect(() => {
        getDataset<PhonePrefixDataSetItem[]>('phonenumbers', loadingContext)
            .then(response => {
                const countriesFilter = (country: PhonePrefixDataSetItem) => allowedCountries.includes(country.id);
                const filteredCountries = allowedCountries.length ? response.filter(countriesFilter) : response;
                const mappedCountries = filteredCountries.map(({ prefix, id }) => ({
                    id: prefix,
                    name: `${prefix} (${id})`,
                    selectedOptionName: prefix
                }));

                setPhonePrefixes(mappedCountries || []);
                setLoadingStatus('ready');
            })
            .catch(error => {
                setPhonePrefixes([]);
                setLoadingStatus('ready');
                handleError?.(new AdyenCheckoutError('ERROR', error));
            });
    }, []);

    return { phonePrefixes, loadingStatus };
}

export default usePhonePrefixes;
