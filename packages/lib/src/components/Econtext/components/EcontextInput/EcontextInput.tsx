import { h, VNode } from 'preact';
import { useRef, useState } from 'preact/hooks';
import PersonalDetails from '../../../internal/PersonalDetails/PersonalDetails';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { econtextValidationRules } from '../../validate';
import { PersonalDetailsSchema } from '../../../../types';
import './EcontextInput.scss';

interface EcontextInputProps {
    personalDetailsRequired?: boolean;
    data?: PersonalDetailsSchema;
    showPayButton?: boolean;
    payButton(config: any): VNode;
    onChange?(data: any): void;
    onSubmit?(state: any, component: any): void;
    [key: string]: any;
}

// An interface for the members exposed by a component to its parent UIElement
interface EcontextRef {
    showValidation?: (who) => void;
    setStatus?: any;
}

export default function EcontextInput({ personalDetailsRequired = true, data, onChange, showPayButton, payButton, ...props }: EcontextInputProps) {
    const personalDetailsRef = useRef(null);
    const setPersonalDetailsRef = ref => {
        personalDetailsRef.current = ref;
    };
    const { i18n } = useCoreContext();

    const [status, setStatus] = useState('ready');

    /** An object by which to expose 'public' members to the parent UIElement */
    const econtextRef = useRef<EcontextRef>({});
    // Just call once
    if (!Object.keys(econtextRef.current).length) {
        props.setComponentRef?.(econtextRef.current);
    }

    econtextRef.current.showValidation = () => {
        personalDetailsRef.current?.showValidation();
    };

    econtextRef.current.setStatus = setStatus;

    return (
        <div className="adyen-checkout__econtext-input__field">
            {!!personalDetailsRequired && (
                <PersonalDetails
                    data={data}
                    requiredFields={['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']}
                    onChange={onChange}
                    namePrefix="econtext"
                    setComponentRef={setPersonalDetailsRef}
                    validationRules={econtextValidationRules}
                />
            )}
            {showPayButton && payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
