import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import PersonalDetails from '../../../internal/PersonalDetails/PersonalDetails';
import useCoreContext from '../../../../core/Context/useCoreContext';

export default function DokuInput(props) {
    const [data, setData] = useState<any>({ ...props.data });
    const [isValid, setIsValid] = useState(false);
    const personalDetailsRef = useRef(null);
    const { i18n } = useCoreContext();

    useEffect(() => {
        props.onChange({ data, isValid });
    }, [data, isValid]);

    const handleChange = (state): void => {
        setData({ ...data, ...state.data });
        setIsValid(state.isValid);
    };

    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    this.showValidation = () => {
        if (personalDetailsRef.current) personalDetailsRef.current.showValidation();
    };

    return (
        <div className="adyen-checkout__doku-input__field">
            <PersonalDetails
                data={data}
                requiredFields={['firstName', 'lastName', 'shopperEmail']}
                onChange={handleChange}
                namePrefix="doku"
                ref={personalDetailsRef}
            />

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
