import { h } from 'preact';
import { useState, useLayoutEffect } from 'preact/hooks';
import Field from '../../FormFields/Field';
import useCoreContext from '../../../../core/Context/useCoreContext';
import getDataset from '../../../../core/Services/get-dataset';
import { CountryFieldProps, CountryFieldItem } from '../types';
import Select from '../../FormFields/Select';

export default function CountryField(props: CountryFieldProps) {
    const { allowedCountries = [], classNameModifiers = [], errorMessage, onDropdownChange, value } = props;
    const { i18n, loadingContext } = useCoreContext();
    const [countries, setCountries] = useState<CountryFieldItem[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [readOnly, setReadOnly] = useState(props.readOnly);

    useLayoutEffect(() => {
        getDataset('countries', loadingContext, i18n.locale)
            .then(response => {
                const countriesFilter = country => allowedCountries.includes(country.id);
                const newCountries = allowedCountries.length ? response.filter(countriesFilter) : response;
                setCountries(newCountries || []);
                setReadOnly(newCountries.length === 1 || readOnly);
                setLoaded(true);
            })
            .catch(error => {
                console.error(error);
                setCountries([]);
                setLoaded(true);
            });
    }, []);

    if (!loaded) return null;

    return (
        <Field
            name={'country'}
            label={i18n.get('country')}
            errorMessage={errorMessage}
            classNameModifiers={classNameModifiers}
            isValid={!!value}
            showValidIcon={false}
            i18n={i18n}
        >
            <Select
                onChange={onDropdownChange}
                name={'country'}
                placeholder={i18n.get('select.country')}
                selectedValue={value}
                items={countries}
                readonly={readOnly && !!value}
            />
        </Field>
    );
}
