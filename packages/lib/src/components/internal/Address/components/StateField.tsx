import { h } from 'preact';
import { useState, useLayoutEffect } from 'preact/hooks';
import Field from '../../FormFields/Field';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import getDataset from '../../../../core/Services/get-dataset';
import { StateFieldItem, StateFieldProps } from '../types';
import Select from '../../FormFields/Select';

export default function StateField(props: StateFieldProps) {
    const { classNameModifiers, label, onDropdownChange, readOnly, selectedCountry, specifications, value } = props;
    const { i18n, loadingContext } = useCoreContext();
    const [states, setStates] = useState<StateFieldItem[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);

    useLayoutEffect(() => {
        if (!selectedCountry || !specifications.countryHasDataset(selectedCountry)) {
            setStates([]);
            setLoaded(true);
            return;
        }

        getDataset(`states/${selectedCountry}`, loadingContext, i18n.locale)
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
        <Field
            label={label}
            classNameModifiers={classNameModifiers}
            errorMessage={props.errorMessage}
            isValid={!!value}
            showValidIcon={false}
            name={'stateOrProvince'}
            i18n={i18n}
            readOnly={readOnly && !!value}
        >
            <Select name={'stateOrProvince'} onChange={onDropdownChange} selectedValue={value} items={states} readonly={readOnly && !!value} />
        </Field>
    );
}
