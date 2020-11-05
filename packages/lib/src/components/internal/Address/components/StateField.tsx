import { h } from 'preact';
import { useState, useLayoutEffect } from 'preact/hooks';
import { renderFormField } from '../../FormFields';
import Field from '../../FormFields/Field';
import useCoreContext from '../../../../core/Context/useCoreContext';
import getDataset from '../../../../core/Services/get-dataset';
import { COUNTRIES_WITH_STATES_DATASET } from '../constants';

export default function StateField(props) {
    const { country, onDropdownChange, value, readOnly } = props;
    const { i18n, loadingContext } = useCoreContext();
    const [states, setStates] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useLayoutEffect(() => {
        if (!country || !COUNTRIES_WITH_STATES_DATASET.includes(country)) {
            setStates([]);
            setLoaded(true);
            return;
        }

        getDataset(`states/${country}`, loadingContext, i18n.locale)
            .then(response => {
                const newStates = response && response.length ? response : [];
                setStates(newStates);
                setLoaded(true);
            })
            .catch(() => {
                setStates([]);
                setLoaded(true);
            });
    }, [country]);

    if (!loaded || !states.length) return null;

    return (
        <Field label={i18n.get('stateOrProvince')} classNameModifiers={['stateOrProvince']} errorMessage={props.errorMessage}>
            {renderFormField('select', {
                name: 'stateOrProvince',
                onChange: onDropdownChange,
                selected: value,
                placeholder: i18n.get('select.stateOrProvince'),
                items: states,
                readonly: readOnly && !!value
            })}
        </Field>
    );
}
