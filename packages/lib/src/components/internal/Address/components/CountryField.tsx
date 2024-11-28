import { h } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import Field from '../../FormFields/Field';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import getDataset from '../../../../core/Services/get-dataset';
import { CountryFieldProps, CountryFieldItem } from '../types';
import Select from '../../FormFields/Select';

const formatCountries = (countries: Array<CountryFieldItem>, allowedCountries: string[]) => {
    const applyFilter = (country: CountryFieldItem) => allowedCountries.includes(country.id);
    const applyMapper = (country: CountryFieldItem) => {
        return {
            ...country,
            name: country.name,
            selectedOptionName: country.name
        };
    };
    return allowedCountries.length ? countries.filter(applyFilter).map(applyMapper) : countries.map(applyMapper);
};

export default function CountryField(props: CountryFieldProps) {
    const { allowedCountries = [], classNameModifiers = [], errorMessage, onDropdownChange, value, required } = props;
    const { i18n, loadingContext } = useCoreContext();
    const [countries, setCountries] = useState<CountryFieldItem[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [readOnly, setReadOnly] = useState(props.readOnly);

    useLayoutEffect(() => {
        getDataset('countries', loadingContext, i18n.locale)
            .then(response => {
                const newCountries = formatCountries(response, allowedCountries);
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
            readOnly={readOnly && !!value}
        >
            <Select
                onChange={onDropdownChange}
                name={'country'}
                selectedValue={value}
                items={countries}
                readonly={readOnly && !!value}
                required={required}
            />
        </Field>
    );
}
