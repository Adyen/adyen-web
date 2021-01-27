import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import PersonalDetails from '../../../internal/PersonalDetails/PersonalDetails';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { EcontextInputSchema } from '../../types';
import Validator from '../../../../utils/Validator';
import { econtextValidationRules } from '../../validate';

export default function EcontextInput(props) {
    const personalDetailsRef = useRef(null);
    const { i18n } = useCoreContext();

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {
        if (personalDetailsRef.current) personalDetailsRef.current.showValidation();
    };

    return (
        <div className="adyen-checkout__econtext-input__field">
            <PersonalDetails
                data={props.data}
                requiredFields={['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']}
                onChange={props.onChange}
                namePrefix="econtext"
                ref={personalDetailsRef}
                validationRules={econtextValidationRules}
            />

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
