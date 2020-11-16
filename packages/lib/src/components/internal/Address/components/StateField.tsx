import { h } from 'preact';
import { useState, useLayoutEffect } from 'preact/hooks';
import { renderFormField } from '../../FormFields';
import Field from '../../FormFields/Field';
import useCoreContext from '../../../../core/Context/useCoreContext';
import fetchJSONData from '../../../../utils/fetch-json-data';
import { getKeyForField } from '../utils';
import { COUNTRIES_WITH_STATES_DATASET } from '../constants';
import { StateFieldItem, StateFieldProps } from '../types';

export default function StateField(props: StateFieldProps) {
    const { classNameModifiers, selectedCountry, onDropdownChange, value, readOnly } = props;
    const { i18n, loadingContext } = useCoreContext();
    const [states, setStates] = useState<StateFieldItem[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const labelKey: string = getKeyForField('stateOrProvince', selectedCountry);
    const placeholderKey: string = getKeyForField('stateOrProvincePlaceholder', selectedCountry);

    useLayoutEffect(() => {
        if (!selectedCountry || !COUNTRIES_WITH_STATES_DATASET.includes(selectedCountry)) {
            setStates([]);
            setLoaded(true);
            return;
        }

        fetchJSONData({
            path: `datasets/states/${selectedCountry}/${i18n.locale}.json`,
            loadingContext
        })
            .then(response => {
                const newStates = response && response.length ? response : [];
                setStates(newStates);
                setLoaded(true);
            })
            .catch(() => {
                setStates([]);
                setLoaded(true);
            });
    }, [selectedCountry]);

    if (!loaded || !states.length) return null;

    return (
        <Field label={i18n.get(labelKey)} classNameModifiers={classNameModifiers} errorMessage={props.errorMessage}>
            {renderFormField('select', {
                name: 'stateOrProvince',
                onChange: onDropdownChange,
                selected: value,
                placeholder: i18n.get(placeholderKey),
                items: states,
                readonly: readOnly && !!value
            })}
        </Field>
    );
}
