import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { pixValidationRules } from './validate';
import { pixFormatters } from './utils';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PixInputDataState } from '../types';
import useForm from '../../../utils/useForm';
import { BrazilPersonalDetail } from '../../internal/SocialSecurityNumberBrazil/BrazilPersonalDetail';

function PixInput(props) {
    const { i18n } = useCoreContext();
    const formSchema = ['firstName', 'lastName', 'socialSecurityNumber'];
    const { handleChangeFor, triggerValidation, setSchema, data, valid, errors, isValid } = useForm<PixInputDataState>({
        schema: formSchema,
        defaultData: props.data,
        rules: pixValidationRules,
        formatters: pixFormatters
    });

    // Handle form schema updates
    useEffect(() => {
        const newSchema = props.personalDetailsRequired ? [...formSchema] : [];
        setSchema(newSchema);
    }, [props.personalDetailsRequired]);

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {
        triggerValidation();
    };

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors]);

    const buttonModifiers = !props.personalDetailsRequired ? ['standalone'] : [];

    return (
        <div className="adyen-checkout__pix-input__field">
            {props.personalDetailsRequired && (
                <BrazilPersonalDetail i18n={i18n} data={data} handleChangeFor={handleChangeFor} errors={errors} valid={valid} />
            )}

            {props.showPayButton &&
                props.payButton({
                    status,
                    label: `${i18n.get('continueTo')} ${props.name}`,
                    classNameModifiers: buttonModifiers
                })}
        </div>
    );
}

PixInput.defaultProps = {
    data: {},
    personalDetailsRequired: false
};

export default PixInput;
