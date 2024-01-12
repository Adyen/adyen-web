import Field from '../../FormFields/Field';
import { h } from 'preact';
import { AddressLookupItem } from '../types';
import { useCallback, useEffect, useState, useMemo } from 'preact/hooks';
import './AddressSearch.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { debounce } from '../utils';
import Select from '../../FormFields/Select';
import { AddressData } from '../../../../types';

export type OnAddressLookupType = (
    value: string,
    actions: {
        resolve: (value: Array<AddressLookupItem>) => void;
        reject: (reason?: any) => void;
    }
) => Promise<void>;

export type OnAddressSelectedType = (
    value: string,
    actions: {
        resolve: (value: AddressLookupItem) => void;
        reject: (reason?: any) => void;
    }
) => Promise<void>;

interface AddressSearchProps {
    onAddressLookup?: OnAddressLookupType;
    onAddressSelected?: OnAddressSelectedType;
    onSelect: (addressItem: AddressData) => void;
    onManualAddress: any;
    externalErrorMessage: string;
    hideManualButton: boolean;
    showContextualElement?: boolean;
    contextualText?: string;
    placeholder?: string;
    addressSearchDebounceMs?: number;
}

interface RejectionReason {
    errorMessage: string;
}

export default function AddressSearch({
    onAddressLookup,
    onAddressSelected,
    onSelect,
    onManualAddress,
    externalErrorMessage,
    hideManualButton,
    showContextualElement,
    contextualText,
    placeholder,
    addressSearchDebounceMs
}: Readonly<AddressSearchProps>) {
    const [formattedData, setFormattedData] = useState([]);
    const [originalData, setOriginalData] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');

    const { i18n } = useCoreContext();
    const mapDataToSelect = data => data.map(({ id, name }) => ({ id, name }));

    const handlePromiseReject = useCallback((reason: RejectionReason) => {
        if (reason?.errorMessage) {
            setErrorMessage(reason.errorMessage);
        }
    }, []);

    const onTextInput = useCallback(
        async (inputValue: string) => {
            new Promise<Array<AddressLookupItem>>((resolve, reject) => {
                onAddressLookup(inputValue, { resolve, reject });
            })
                .then(searchArray => {
                    setOriginalData(searchArray);
                    setFormattedData(mapDataToSelect(searchArray));
                    setErrorMessage('');
                })
                .catch(reason => handlePromiseReject(reason));
        },
        [onAddressLookup]
    );

    // update error message when there's a new one
    useEffect(() => {
        setErrorMessage(externalErrorMessage);
    }, [externalErrorMessage]);

    const onSelectItem = async event => {
        if (!event.target.value) {
            setErrorMessage(i18n.get('address.errors.incomplete'));
            return;
        }
        const value = originalData.find(item => item.id === event.target.value);

        // 1. in case we don't get a function just select item
        if (typeof onAddressSelected !== 'function') {
            onSelect(value);
            setFormattedData([]);
            return;
        }

        // 2. in case callback is provided, create and call onAddressSelected
        new Promise<AddressLookupItem>((resolve, reject) => {
            onAddressSelected(value, { resolve, reject });
        })
            .then(fullData => {
                onSelect(fullData);
                setFormattedData([]);
            })
            .catch(reason => handlePromiseReject(reason));
    };

    const debounceInputHandler = useMemo(() => debounce(onTextInput, addressSearchDebounceMs), []);

    return (
        <div className={'adyen-checkout__address-search adyen-checkout__field-group'}>
            <Field
                label={i18n.get('address')}
                classNameModifiers={['address-search']}
                errorMessage={errorMessage}
                name={'address-search'}
                showContextualElement={showContextualElement}
                contextualText={contextualText}
            >
                <Select
                    name={'address-search'}
                    className={'adyen-checkout__address-search__dropdown'}
                    placeholder={placeholder}
                    onInput={debounceInputHandler}
                    items={formattedData}
                    onChange={onSelectItem}
                    disableTextFilter={true}
                    blurOnClose={true}
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
    );
}
