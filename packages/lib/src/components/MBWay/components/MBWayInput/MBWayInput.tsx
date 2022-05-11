import { h } from 'preact';
import { useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { MBWayDataState, MBWayInputProps } from './types';
import './MBWayInput.scss';
import useForm from '../../../../utils/useForm';
import getDataset from '../../../../core/Services/get-dataset';
import { DataSet } from '../../../../core/Services/data-set';
import PhoneInput from '../../../internal/PhoneInputNew';
const phoneNumberRegEx = /^[+]*[0-9]{1,4}[\s/0-9]*$/;

function MBWayInput(props: MBWayInputProps) {
    const { i18n, loadingContext } = useCoreContext();

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
    this.showValidation = phoneInputRef?.current?.triggerValidation;

    useLayoutEffect(() => {
        getDataset('phonenumbers', loadingContext)
            .then(response => {
                const countriesFilter = country => allowedCountries.includes(country.id);
                const filteredCountries = allowedCountries.length ? response.filter(countriesFilter) : response;
                const mappedCountries = filteredCountries.map(item => {
                    // Get country flags (magic! - shifts the country code characters to the correct position of the emoji in the unicode space)
                    const codePoints: number[] = item.id
                        .toUpperCase()
                        .split('')
                        .map(char => 127397 + char.charCodeAt(0));

                    // Get flag emoji + space at end (it doesn't work to add spaces in the template literal, below)
                    const flag = String.fromCodePoint ? String.fromCodePoint(...codePoints) + '\u00A0\u00A0' : '';

                    return { id: item.prefix, name: `${flag} ${item.prefix} (${item.id})`, selectedOptionName: `${flag} ${item.prefix}` };
                });

                setPhonePrefixes(mappedCountries || []);
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

    const onChange = ({ data, valid, errors, isValid }) => {
        console.log('### MBWayInput::onChange:: data=', data);
        props.onChange({ data, valid, errors, isValid });
    };

    return (
        <div className="adyen-checkout__mb-way">
            <PhoneInput {...props} items={phonePrefixes} ref={phoneInputRef} onChange={onChange} data={props.data} />

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

MBWayInput.defaultProps = {
    onChange: () => {},
    phoneNumberErrorKey: 'mobileNumber.invalid'
};

export default MBWayInput;
