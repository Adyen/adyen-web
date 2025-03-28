import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { pixValidationRules } from './validate';
import { pixFormatters } from './utils';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import useForm from '../../../utils/useForm';
import { BrazilPersonalDetail } from '../../internal/SocialSecurityNumberBrazil/BrazilPersonalDetail';
import { PixInputDataState, PixInputProps } from './types';

function PixInput({ name, data: dataProps, personalDetailsRequired, showPayButton, onChange, payButton }: PixInputProps) {
    const { i18n } = useCoreContext();
    const formSchema = ['firstName', 'lastName', 'socialSecurityNumber'];
    console.log(dataProps);

    const { handleChangeFor, triggerValidation, setSchema, data, valid, errors, isValid } = useForm<PixInputDataState>({
        schema: formSchema,
        defaultData: dataProps,
        rules: pixValidationRules,
        formatters: pixFormatters
    });

    // Handle form schema updates
    useEffect(() => {
        const newSchema = personalDetailsRequired ? [...formSchema] : [];
        setSchema(newSchema);
    }, [personalDetailsRequired]);

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {
        triggerValidation();
    };

    useEffect(() => {
        onChange({ data, valid, errors, isValid });
    }, [onChange, data, valid, errors]);

    const buttonModifiers = !personalDetailsRequired ? ['standalone'] : [];

    return (
        <div className="adyen-checkout__pix-input__field" style={!showPayButton && !personalDetailsRequired ? { display: 'none' } : null}>
            {personalDetailsRequired && (
                <BrazilPersonalDetail i18n={i18n} data={data} handleChangeFor={handleChangeFor} errors={errors} valid={valid} />
            )}

            {showPayButton &&
                payButton({
                    status,
                    label: `${i18n.get('continueTo')} ${name}`,
                    classNameModifiers: buttonModifiers
                })}
        </div>
    );
}

export default PixInput;
