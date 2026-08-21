import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { MBWayInputProps } from './types';
import './MBWayInput.scss';
import PhoneInputForm from '../../../internal/PhoneInput';
import LoadingWrapper from '../../../internal/LoadingWrapper';
import usePhonePrefixes from '../../../internal/PhoneInput/usePhonePrefixes';
import { ComponentMethodsRef } from '../../../types';

function MBWayInput(props: Readonly<MBWayInputProps>) {
    const { i18n, loadingContext } = useCoreContext();

    const { allowedCountries = [] } = props;

    const [status, setStatus] = useState<string>('ready');

    const mbWayInputRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        props.setComponentRef(mbWayInputRef.current);
    }, [props.setComponentRef]);

    const { loadingStatus: prefixLoadingStatus, phonePrefixes } = usePhonePrefixes({ allowedCountries, loadingContext, handleError: props.onError });

    const onChange = ({ data, valid, errors, isValid }) => {
        props.onChange({ data, valid, errors, isValid });
    };

    return (
        <LoadingWrapper status={prefixLoadingStatus}>
            <div className="adyen-checkout__mb-way">
                <PhoneInputForm
                    setComponentRef={ref => {
                        mbWayInputRef.current = {
                            ...mbWayInputRef.current,
                            ...ref
                        };
                    }}
                    {...props}
                    items={phonePrefixes}
                    onChange={onChange}
                    data={props.data}
                />

                {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
            </div>
        </LoadingWrapper>
    );
}

MBWayInput.defaultProps = {
    onChange: () => {},
    phoneNumberKey: 'mobileNumber',
    phoneNumberErrorKey: 'mobileNumber.invalid'
};

export default MBWayInput;
