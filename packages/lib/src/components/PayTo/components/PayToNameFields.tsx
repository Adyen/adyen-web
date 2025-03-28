import { h, Fragment } from 'preact';
import Field from '../../internal/FormFields/Field';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import InputText from '../../internal/FormFields/InputText';
import Language from '../../../language';
import { HandleChangeForModeType } from '../../../utils/useForm/types';

export interface PayToNameFieldsProps {
    i18n: Language;
    errors: {
        [key: string]: any;
    };
    data: {
        firstName: string;
        lastName: string;
    };
    handleChangeFor: (key: string, mode?: HandleChangeForModeType) => (e: any) => void;
    placeholders: {
        firstName: string;
        lastName: string;
    };
}

export default function PayToNameFields({ i18n, errors, data, handleChangeFor, placeholders }: PayToNameFieldsProps) {
    return (
        <Fragment>
            <Field
                label={i18n.get('payto.label.firstName')}
                classNameModifiers={['col-50', 'firstName']}
                errorMessage={getErrorMessage(i18n, errors.firstName, i18n.get('firstName'))}
                name={'firstName'}
                i18n={i18n}
            >
                <InputText
                    name={'firstName'}
                    value={data.firstName}
                    classNameModifiers={['firstName']}
                    onInput={handleChangeFor('firstName', 'input')}
                    onBlur={handleChangeFor('firstName', 'input')}
                    placeholder={placeholders?.firstName}
                    spellCheck={false}
                    required={true}
                />
            </Field>
            <Field
                label={i18n.get('payto.label.lastName')}
                classNameModifiers={['col-50', 'lastName']}
                errorMessage={getErrorMessage(i18n, errors.lastName, i18n.get('lastName'))}
                name={'lastName'}
                i18n={i18n}
            >
                <InputText
                    name={'lastName'}
                    value={data.lastName}
                    classNameModifiers={['lastName']}
                    onInput={handleChangeFor('lastName', 'input')}
                    onBlur={handleChangeFor('lastName', 'blur')}
                    placeholder={placeholders?.lastName}
                    spellCheck={false}
                    required={true}
                />
            </Field>
        </Fragment>
    );
}
