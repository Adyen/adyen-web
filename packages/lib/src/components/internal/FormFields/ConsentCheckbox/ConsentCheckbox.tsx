import { h } from 'preact';
import Field from '../Field';
import Checkbox from '../Checkbox';

export default function ConsentCheckbox({ errorMessage, label, onChange, i18n, ...props }) {
    return (
        <Field classNameModifiers={['consentCheckbox']} errorMessage={errorMessage} i18n={i18n} name={'consentCheckbox'} useLabelElement={false}>
            <Checkbox
                name={'consentCheckbox'}
                classNameModifiers={[...(props.classNameModifiers ??= []), 'consentCheckbox']}
                onInput={onChange}
                value={props?.data?.consentCheckbox}
                label={label}
                checked={props.checked}
            />
        </Field>
    );
}
