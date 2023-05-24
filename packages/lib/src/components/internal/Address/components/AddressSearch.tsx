import Field from '../../FormFields/Field';
import { h } from 'preact';
import renderFormField from '../../FormFields';
import { AddressLookupItem } from '../types';
import { useCallback, useState } from 'preact/hooks';

interface AddressSearchProps {
    onAddressLookup?: (string) => Promise<Array<AddressLookupItem>>;
    onSelect: any; //TODO
}

export default function AddressSearch({ onAddressLookup, onSelect }: AddressSearchProps) {
    const [formattedData, setFormattedData] = useState([]);
    const [originalData, setOriginalData] = useState([]);

    const mapDataToSelect = data => data.map(({ id, name }) => ({ id, name }));

    const onInput = useCallback(
        async event => {
            console.log(event);
            const data = await onAddressLookup(event);
            setOriginalData(data);
            setFormattedData(mapDataToSelect(data));
        },
        [onAddressLookup]
    );

    const onChange = event => {
        const value = originalData.find(item => item.id === event.target.value);
        onSelect(value);
    };

    return (
        <Field classNameModifiers={['']}>
            {renderFormField('select', {
                name: 'issuer',
                className: 'adyen-checkout__issuer-list__dropdown',
                onInput: onInput,
                items: formattedData,
                onChange: onChange
            })}
        </Field>
    );
}
