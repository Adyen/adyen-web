import { h } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import { renderFormField } from '../../FormFields';
import Field from '../../FormFields/Field';
import useCoreContext from '../../../../core/Context/useCoreContext';
import getDataset from '../../../../core/Services/get-dataset';
import { CountryFieldItem, CountryFieldProps } from '../types';
import { getFlagEmoji } from '../../../../utils/getFlagEmoji';

const formatCountries = (countries: Array<CountryFieldItem>, allowedCountries: string[]) => {
    const applyFilter = (country: CountryFieldItem) => allowedCountries.includes(country.id);
    const applyMapper = (country: CountryFieldItem) => {
        const flag = getFlagEmoji(country.id);
        return {
            ...country,
            name: `${flag} ${country.name}`,
            selectedOptionName: `${flag} ${country.name}`
        };
    };
    return (allowedCountries.length ? countries.filter(applyFilter) : countries).map(applyMapper);
};

export default function CountryField(props: CountryFieldProps) {
    const { allowedCountries = [], classNameModifiers = [], errorMessage, onDropdownChange, value } = props;
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
        >
            {renderFormField('select', {
                onChange: onDropdownChange,
                name: 'country',

                selected: value,
                items: countries,
                readonly: readOnly && !!value
            })}
        </Field>
    );
}
