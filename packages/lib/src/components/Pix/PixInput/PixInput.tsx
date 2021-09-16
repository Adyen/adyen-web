import {h} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import {renderFormField} from '../../internal/FormFields';
import Field from '../../internal/FormFields/Field';
import {pixValidationRules} from './validate';
import {pixFormatters} from './utils';
import useCoreContext from '../../../core/Context/useCoreContext';
import {PixInputDataState} from '../types';
import useForm from '../../../utils/useForm';
import SocialSecurityNumberBrazil from "../../internal/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil";

function PixInput(props) {
    const {i18n} = useCoreContext();
    const addressRef = useRef(null);
    const formSchema = ['firstName', 'lastName', 'socialSecurityNumber'];
    const {handleChangeFor, triggerValidation, setSchema, data, valid, errors, isValid} = useForm<PixInputDataState>({
        schema: formSchema,
        defaultData: props.data,
        rules: pixValidationRules,
        formatters: pixFormatters
    });

    // Handle form schema updates
    useEffect(() => {
        const newSchema = [
            ...(props.personalDetailsRequired ? formSchema : []),
        ];
        setSchema(newSchema);
    }, [props.personalDetailsRequired]);


    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {
        triggerValidation();
        if (props.billingAddressRequired) {
            addressRef.current.showValidation();
        }
    };

    useEffect(() => {
        props.onChange({data, valid, errors, isValid});
    }, [data, valid, errors]);

    const buttonModifiers = !props.personalDetailsRequired ? ['standalone'] : [];

    return (
        <div className="adyen-checkout__pix-input__field">
            {props.personalDetailsRequired && <div
                className={'adyen-checkout__fieldset adyen-checkout__fieldset--address adyen-checkout__fieldset--personalDetails'}>
                <div className="adyen-checkout__fieldset__title">{i18n.get('personalDetails')}</div>

                <div className="adyen-checkout__fieldset__fields">
                    <Field label={i18n.get('firstName')} classNameModifiers={['firstName', 'col-50']}
                           errorMessage={!!errors.firstName}>
                        {renderFormField('text', {
                            name: 'firstName',
                            autocorrect: 'off',
                            spellcheck: false,
                            value: data.firstName,
                            onInput: handleChangeFor('firstName', 'input'),
                            onChange: handleChangeFor('firstName')
                        })}
                    </Field>

                    <Field label={i18n.get('lastName')} classNameModifiers={['lastName', 'col-50']}
                           errorMessage={!!errors.lastName}>
                        {renderFormField('text', {
                            name: 'lastName',
                            autocorrect: 'off',
                            spellcheck: false,
                            value: data.lastName,
                            onInput: handleChangeFor('lastName', 'input'),
                            onChange: handleChangeFor('lastName')
                        })}
                    </Field>

                    <SocialSecurityNumberBrazil
                        data={data.socialSecurityNumber}
                        error={errors.socialSecurityNumber}
                        valid={valid.socialSecurityNumber}
                        onInput={handleChangeFor('socialSecurityNumber', 'input')}
                        onChange={handleChangeFor('socialSecurityNumber')}
                    />
                </div>
            </div>}

            {props.showPayButton && props.payButton({
                status,
                label: `${i18n.get('continueTo')} ${props.name}`,
                classNameModifiers: buttonModifiers
            })}
        </div>
    );
}

PixInput.defaultProps = {
    data: {},
    personalDetailsRequired: false,
};

export default PixInput;
