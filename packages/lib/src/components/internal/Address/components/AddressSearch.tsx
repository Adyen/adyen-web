import Field from '../../FormFields/Field';
import { h } from 'preact';
import renderFormField from '../../FormFields';
import { AddressLookupItem } from '../types';
import { useCallback, useState } from 'preact/hooks';

interface AddressSearchProps {
    onAddressLookup?: (string) => Promise<Array<AddressLookupItem>>;
}

export default function AddressSearch({ onAddressLookup }: AddressSearchProps) {
    const [formattedData, setFormattedData] = useState([]);

    const onInput = useCallback(
        async event => {
            console.log(event);
            const data = await onAddressLookup(event);
            setFormattedData(data.map(({ id, name }) => ({ id, name })));
        },
        [onAddressLookup]
    );

    return (
        <Field classNameModifiers={['']}>
            {renderFormField('select', {
                name: 'issuer',
                className: 'adyen-checkout__issuer-list__dropdown',
                onInput: onInput,
                items: formattedData
            })}
        </Field>
    );
}
