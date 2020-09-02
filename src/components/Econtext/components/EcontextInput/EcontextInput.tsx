import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import PersonalDetails from '../../../internal/PersonalDetails/PersonalDetails';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { EcontextInputSchema } from '../../types';
import Validator from '../../../../utils/Validator';
import { econtextValidationRules } from '../../validate';

export default function EcontextInput(props) {
    const [data, setData] = useState<EcontextInputSchema>({ ...props.data });
    const [isValid, setIsValid] = useState(false);
    const personalDetailsRef = useRef(null);
    const { i18n } = useCoreContext();
    const validator = new Validator(econtextValidationRules);

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
        <div className="adyen-checkout__econtext-input__field">
            <PersonalDetails
                data={data}
                requiredFields={['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']}
                onChange={handleChange}
                namePrefix="econtext"
                ref={personalDetailsRef}
                validator={validator}
            />

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
