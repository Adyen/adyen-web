import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import PersonalDetails from '../../../internal/PersonalDetails/PersonalDetails';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { ComponentMethodsRef } from '../../../types';

export default function DokuInput(props) {
    const personalDetailsRef = useRef(null);
    const setPersonalDetailsRef = ref => {
        personalDetailsRef.current = ref;
    };

    const { i18n } = useCoreContext();

    const [status, setStatus] = useState('ready');

    /** An object by which to expose 'public' members to the parent UIElement */
    const dokuRef = useRef<ComponentMethodsRef>({});
    // Just call once
    if (!Object.keys(dokuRef.current).length) {
        props.setComponentRef?.(dokuRef.current);
    }

    dokuRef.current.showValidation = () => {
        personalDetailsRef.current?.showValidation();
    };

    dokuRef.current.setStatus = setStatus;

    return (
        <div className="adyen-checkout__doku-input__field">
            <PersonalDetails
                data={props.data}
                requiredFields={['firstName', 'lastName', 'shopperEmail']}
                onChange={props.onChange}
                namePrefix="doku"
                setComponentRef={setPersonalDetailsRef}
            />

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
