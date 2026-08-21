import { h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { MBWayInputProps } from './types';
import './MBWayInput.scss';
import PhoneInputForm from '../../../internal/PhoneInput';
import LoadingWrapper from '../../../internal/LoadingWrapper';
import usePhonePrefixes from '../../../internal/PhoneInput/usePhonePrefixes';
import type { ComponentMethodsRef } from '../../../internal/UIElement/types';

function MBWayInput(props: Readonly<MBWayInputProps>) {
    const { i18n, loadingContext } = useCoreContext();

    const { allowedCountries = [] } = props;

    const [status, setStatus] = useState<string>('ready');

    const { loadingStatus: prefixLoadingStatus, phonePrefixes } = usePhonePrefixes({ allowedCountries, loadingContext, handleError: props.onError });

    const mbwayRef = useRef<ComponentMethodsRef>({
        setStatus,
        showValidation: () => {}
    });

    const onChange = ({ data, valid, errors, isValid }) => {
        props.onChange({ data, valid, errors, isValid });
    };

    const setPhoneInputRef = useCallback(
        (ref: ComponentMethodsRef) => {
            mbwayRef.current.showValidation = ref.showValidation;
            props.setComponentRef(mbwayRef.current);
        },
        [props.setComponentRef]
    );

    return (
        <LoadingWrapper status={prefixLoadingStatus}>
            <div className="adyen-checkout__mb-way">
                <PhoneInputForm {...props} setComponentRef={setPhoneInputRef} items={phonePrefixes} onChange={onChange} data={props.data} />

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
