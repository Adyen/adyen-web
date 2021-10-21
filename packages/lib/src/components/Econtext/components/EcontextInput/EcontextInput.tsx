import { h, VNode } from 'preact';
import { useRef, useState } from 'preact/hooks';
import PersonalDetails from '../../../internal/PersonalDetails/PersonalDetails';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { econtextValidationRules } from '../../validate';
import { PersonalDetailsSchema } from '../../../../types';
import './EcontextInput.css';

interface EcontextInputProps {
    personalDetailsRequired?: boolean;
    data: PersonalDetailsSchema;
    showPayButton: boolean;
    payButton(config: any): VNode;
    onChange(data: any): void;
    onSubmit(state: any, component: any): void;
}

export default function EcontextInput({ personalDetailsRequired = true, data, onChange, showPayButton, payButton }: EcontextInputProps) {
    const personalDetailsRef = useRef(null);
    const { i18n } = useCoreContext();

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;

    this.showValidation = () => {
        if (personalDetailsRef.current) personalDetailsRef.current.showValidation();
    };

    return (
        <div className="adyen-checkout__econtext-input__field">
            {!!personalDetailsRequired && (
                <PersonalDetails
                    data={data}
                    requiredFields={['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']}
                    onChange={onChange}
                    namePrefix="econtext"
                    ref={personalDetailsRef}
                    validationRules={econtextValidationRules}
                />
            )}
            {showPayButton && payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
