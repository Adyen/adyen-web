import { h } from 'preact';
import Field from '../../../internal/FormFields/Field';
import Checkbox from '../../../internal/FormFields/Checkbox';
import ConsentCheckboxLabel from './ConsentCheckboxLabel';

export default function ConsentCheckbox({ countryCode, data, errorMessage, onChange }) {
    return (
        <Field classNameModifiers={['consentCheckbox']} errorMessage={errorMessage}>
            <Checkbox
                name="consentCheckbox"
                classNameModifiers={['consentCheckbox']}
                onInput={onChange}
                value={data.consentCheckbox}
                label={<ConsentCheckboxLabel countryCode={countryCode} />}
            />
        </Field>
    );
}
