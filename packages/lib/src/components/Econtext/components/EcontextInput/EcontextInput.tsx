import { Fragment, h, VNode } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import PersonalDetails from '../../../internal/PersonalDetails/PersonalDetails';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { econtextValidationRules } from '../../validate';
import { PersonalDetailsSchema } from '../../../../types/global-types';
import FormInstruction from '../../../internal/FormInstruction';
import { ComponentMethodsRef } from '../../../internal/UIElement/types';
import './EcontextInput.scss';

interface EcontextInputProps {
    setComponentRef: (ref: ComponentMethodsRef) => void;
    personalDetailsRequired?: boolean;
    data?: PersonalDetailsSchema;
    showPayButton: boolean;
    payButton(config: any): VNode;
    onChange?(data: any): void;
    onSubmit?(state: any, component: any): void;
}

export default function EcontextInput({
    data,
    onChange,
    showPayButton,
    payButton,
    setComponentRef,
    personalDetailsRequired = true
}: Readonly<EcontextInputProps>) {
    const { i18n } = useCoreContext();

    const [status, setStatus] = useState('ready');

    const econtextRef = useRef<ComponentMethodsRef>({
        setStatus
    });

    useEffect(() => {
        setComponentRef(econtextRef.current);
    }, [setComponentRef]);

    const personalDetailsRef = useRef<ComponentMethodsRef | null>(null);
    const setPersonalDetailsRef = (ref: ComponentMethodsRef) => {
        personalDetailsRef.current = ref;
        econtextRef.current = {
            setStatus: econtextRef.current?.setStatus,
            showValidation: ref.showValidation
        };
        setComponentRef(econtextRef.current);
    };

    return (
        <div className="adyen-checkout__econtext-input__field">
            {personalDetailsRequired && (
                <Fragment>
                    <FormInstruction />
                    <PersonalDetails
                        data={data}
                        requiredFields={['firstName', 'lastName', 'telephoneNumber', 'shopperEmail']}
                        onChange={onChange}
                        namePrefix="econtext"
                        setComponentRef={setPersonalDetailsRef}
                        validationRules={econtextValidationRules}
                    />
                </Fragment>
            )}
            {showPayButton && payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
