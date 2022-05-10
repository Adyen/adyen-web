import { h } from 'preact';
import { useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import classNames from 'classnames';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Field from '../../../internal/FormFields/Field';
import { renderFormField } from '../../../internal/FormFields';
import { MBWayDataState, MBWayInputProps } from './types';
import './MBWayInput.scss';
import useForm from '../../../../utils/useForm';
import getDataset from '../../../../core/Services/get-dataset';
import { DataSet } from '../../../../core/Services/data-set';
import PhoneInput from '../../../internal/PhoneInputNew';
const phoneNumberRegEx = /^[+]*[0-9]{1,4}[\s/0-9]*$/;

function MBWayInput(props: MBWayInputProps) {
    const {
        i18n,
        loadingContext
        // commonProps: { isCollatingErrors }
    } = useCoreContext();

    const phoneInputRef = useRef(null);

    const { allowedCountries = [] } = props;
    const [phonePrefixes, setPhonePrefixes] = useState<DataSet>([]);

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<MBWayDataState>({
        schema: ['telephoneNumber'],
        defaultData: props.data,
        rules: {
            telephoneNumber: {
                validate: num => phoneNumberRegEx.test(num) && num.length >= 7,
                errorMessage: 'mobileNumber.invalid',
                modes: ['blur']
            }
        },
        formatters: {
            telephoneNumber: num => num.replace(/[^0-9+\s]/g, '')
        }
    });

    const [status, setStatus] = useState('ready');

    this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    useLayoutEffect(() => {
        getDataset('phonenumbers', loadingContext)
            .then(response => {
                const countriesFilter = country => allowedCountries.includes(country.id);
                const newCountries = allowedCountries.length ? response.filter(countriesFilter) : response;
                console.log('### MBWayInput::newCountries:: ', newCountries);
                setPhonePrefixes(newCountries || []);
                // setLoaded(true);
            })
            .catch(error => {
                console.log('### MBWayInput::getDataset:: phonenumbers:: error=', error);
                setPhonePrefixes([]);
                // setLoaded(true);
            });
    }, []);

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    return (
        <div className="adyen-checkout__mb-way">
            {/*<Field*/}
            {/*    errorMessage={!!errors.telephoneNumber && i18n.get('mobileNumber.invalid')}*/}
            {/*    label={i18n.get('mobileNumber')}*/}
            {/*    className={classNames('adyen-checkout__input--phone-number')}*/}
            {/*    isValid={valid.telephoneNumber}*/}
            {/*    dir={'ltr'}*/}
            {/*    name={'telephoneNumber'}*/}
            {/*>*/}
            {/*{renderFormField('tel', {
                    value: data.telephoneNumber,
                    className: 'adyen-checkout__pm__phoneNumber__input',
                    placeholder: props.placeholders.telephoneNumber,
                    required: true,
                    autoCorrect: 'off',
                    onBlur: handleChangeFor('telephoneNumber', 'blur'),
                    onInput: handleChangeFor('telephoneNumber', 'input')
                })}*/}

            <PhoneInput {...props} items={phonePrefixes} ref={phoneInputRef} />
            {/*</Field>*/}

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

MBWayInput.defaultProps = {
    onChange: () => {}
};

export default MBWayInput;
