import { h } from 'preact';
import './ErrorPanel.scss';
import { ValidationRuleResult } from '../../utils/Validator/Validator';

interface FieldError {
    errorMessage?: string;
    errorI18n?: string;
    // error: string;
    // rootNode?: HTMLElement;
    // isValid?: boolean;
    // shouldValidate?: boolean;
}

export interface ErrorObj {
    holderName?: ValidationRuleResult;
    socialSecurityNumber?: ValidationRuleResult;
    taxNumber?: ValidationRuleResult;
    billingAddress?: ValidationRuleResult;
    encryptedCardNumber?: FieldError;
    encryptedExpiryDate?: FieldError;
    encryptedSecurityCode?: FieldError;
    encryptedBankAccountNumber?: FieldError;
    encryptedBankLocationId?: FieldError;
    encryptedPassword?: FieldError;
    encryptedPin?: FieldError;
}

export interface ErrorPanelObj {
    errorMessages: string[];
    fieldList: string[];
}

export interface ErrorPanelProps {
    id?: string;
    heading?: string;
    errors: ErrorPanelObj;
    focusFn: (who) => void;
}

export function ErrorPanel({ id = 'ariaConsolidatedErrorField', heading = 'Errors:', errors, focusFn }: ErrorPanelProps) {
    if (!errors) return null;

    const defaultHeading: string = heading;

    const { errorMessages, fieldList } = errors;

    console.log('### ErrorPanel:: errorMessages', errorMessages);
    console.log('### ErrorPanel:: fieldList', fieldList);

    // If pay button has just been pressed - we will set focus on the first field in error
    focusFn(fieldList[0]);

    return (
        <div className="adyen-checkput__error-panel" id={id} aria-live="polite">
            {/*<div className="sr-only" id={id} aria-live="polite">*/}
            <div className="adl-alert adl-alert--error">
                <div className="adl-alert__header">
                    <span className="adl-alert__icon">
                        <i className="adl-icon-triangle"></i>
                    </span>
                    <span className="adl-alert__title">{defaultHeading}</span>
                </div>
                {errorMessages.map(error => (
                    <div key={error} className="adl-alert__explanation">
                        {error}
                    </div>
                ))}
            </div>
        </div>
    );
}
