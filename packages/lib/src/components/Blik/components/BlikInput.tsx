import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import Field from '../../internal/FormFields/Field';

import { renderFormField } from '../../internal/FormFields';
import { UIElementProps } from '../../types';
import './BlikInput.scss';
import useForm from '../../../utils/useForm';
import { digitsOnlyFormatter } from '../../../utils/Formatters/formatters';
import useImage from '../../../core/Context/useImage';

interface BlikInputProps extends UIElementProps {
    data?: BlikInputDataState;
}

interface BlikInputDataState {
    blikCode: string;
}

function BlikInput(props: BlikInputProps) {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<BlikInputDataState>({
        schema: ['blikCode'],
        rules: {
            blikCode: {
                validate: code => code?.length === 6,
                errorMessage: 'blik.invalid',
                modes: ['blur']
            }
        },
        formatters: {
            blikCode: digitsOnlyFormatter
        }
    });

    useEffect(() => {
        props.onChange({ data, errors, valid, isValid }, this);
    }, [data, valid, errors, isValid]);

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    return (
        <div className="adyen-checkout__blik">
            <p className="adyen-checkout__blik__helper">{i18n.get('blik.help')}</p>
            <Field
                errorMessage={!!errors.blikCode && i18n.get(errors.blikCode.errorMessage)}
                label={i18n.get('blik.code')}
                classNameModifiers={['blikCode', '50']}
                isValid={valid.blikCode}
                dir={'ltr'}
            >
                {renderFormField('text', {
                    value: data.blikCode,
                    name: 'blikCode',
                    spellcheck: false,
                    required: true,
                    autocorrect: 'off',
                    autocomplete: 'off',
                    onInput: handleChangeFor('blikCode', 'input'),
                    onBlur: handleChangeFor('blikCode', 'blur'),
                    placeholder: '123456',
                    inputMode: 'numeric',
                    maxLength: 6
                })}
            </Field>

            {props.showPayButton &&
                props.payButton({
                    status,
                    icon: getImage({ loadingContext, imageFolder: 'components/' })('lock')
                })}
        </div>
    );
}

BlikInput.defaultProps = { data: { blikCode: '' } };

export default BlikInput;
