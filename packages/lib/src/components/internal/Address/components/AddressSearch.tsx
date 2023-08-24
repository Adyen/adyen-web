import Field from '../../FormFields/Field';
import { Fragment, h } from 'preact';
import { AddressLookupItem } from '../types';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import './AddressSearch.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { debounce } from '../utils';
import Select from '../../FormFields/Select';

export type OnAddressLookupType = (
    value: string,
    actions: {
        resolve: (value: Array<AddressLookupItem>) => void;
        reject: (reason?: any) => void;
    }
) => Promise<void>;

interface AddressSearchProps {
    onAddressLookup?: OnAddressLookupType;
    onSelect: any; //TODO
    onManualAddress: any;
    externalErrorMessage: string;
    hideManualButton: boolean;
}

export default function AddressSearch({ onAddressLookup, onSelect, onManualAddress, externalErrorMessage, hideManualButton }: AddressSearchProps) {
    const [formattedData, setFormattedData] = useState([]);
    const [originalData, setOriginalData] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');

    const { i18n } = useCoreContext();
    const mapDataToSelect = data => data.map(({ id, name }) => ({ id, name }));

    const onInput = useCallback(
        async event => {
            new Promise<Array<AddressLookupItem>>((resolve, reject) => {
                onAddressLookup(event, { resolve, reject });
            })
                .then(data => {
                    setOriginalData(data);
                    setFormattedData(mapDataToSelect(data));
                    setErrorMessage('');
                })
                .catch(reason => {
                    setErrorMessage(reason);
                    console.error('error', reason);
                });
        },
        [onAddressLookup]
    );

    // update error message when there's a new one
    useEffect(() => {
        setErrorMessage(externalErrorMessage);
    }, [externalErrorMessage]);

    const onChange = event => {
        if (!event.target.value) {
            setErrorMessage(i18n.get('address.errors.incomplete'));
            return;
        }
        const value = originalData.find(item => item.id === event.target.value);
        onSelect(value);
        setFormattedData([]);
    };

    const debounceInputHandler = useMemo(() => debounce(onInput), []);

    return (
        <Fragment>
            <div className={'adyen-checkout__address-search adyen-checkout__field-group'}>
                <Field label={i18n.get('address')} classNameModifiers={['address-search']} errorMessage={errorMessage} name={'address-search'}>
                    <Select
                        name={'address-search'}
                        className={'adyen-checkout__address-search__dropdown'}
                        //placeholder={i18n.get('address.placeholder')}
                        onInput={debounceInputHandler}
                        items={formattedData}
                        onChange={onChange}
                        disableTextFilter={true}
                    />
                </Field>
                {!hideManualButton && (
                    <span className="adyen-checkout__address-search__manual-add">
                        <button
                            type="button"
                            className="adyen-checkout__button adyen-checkout__button--inline adyen-checkout__button--link adyen-checkout__address-search__manual-add__button"
                            onClick={onManualAddress}
                        >
                            {'+ ' + i18n.get('address.enterManually')}
                        </button>
                    </span>
                )}
            </div>
        </Fragment>
    );
}
