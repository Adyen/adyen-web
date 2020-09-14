import { h } from 'preact';
import Field from '../Field';
import Checkbox from '../Checkbox';

export default function ConsentCheckbox({ data, errorMessage, label, onChange }) {
    return (
        <Field classNameModifiers={['consentCheckbox']} errorMessage={errorMessage}>
            <Checkbox name="consentCheckbox" classNameModifiers={['consentCheckbox']} onInput={onChange} value={data.consentCheckbox} label={label} />
        </Field>
    );
}
