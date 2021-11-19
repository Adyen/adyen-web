import { h } from 'preact';
import './ErrorPanel.scss';
import Language from '../../language/Language';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import { ValidationRuleResult } from '../../utils/Validator/Validator';

interface FieldError {
    errorMessage?: string;
    errorI18n?: string;
    // error: string;
    // rootNode?: HTMLElement;
    // isValid?: boolean;
    // shouldValidate?: boolean;
}

interface ErrorObj {
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

export interface ErrorPanelProps {
    id?: string;
    errors: ErrorObj;
    i18n: Language;
    focusFn: (who) => void;
    layout: string[];
}

function mapFieldKey(key: string, i18n: Language) {
    switch (key) {
        case 'holderName':
            return i18n.get(`creditCard.${key}`);
            break;
        default: {
            // Map all securedField field types to 'creditCard' - with 2 exceptions
            const type = ['ach', 'giftcard'].includes(key) ? key : 'creditCard';
            return i18n.get(`${type}.${key}.aria.label`);
        }
    }
}

export function ErrorPanel({ id = 'ariaConsolidatedErrorField', errors, i18n, layout, focusFn }: ErrorPanelProps) {
    const defaultHeading: string = i18n.get('Existing errors:');

    console.log('\n### ErrorPanel::errors:: ', errors);
    console.log('### ErrorPanel::layout:: ', layout);

    // Create array of fields with active errors, ordered according to passed layout
    const keyList = Object.entries(errors).reduce((acc, [key, value]) => {
        if (value) {
            acc.push(key);
            acc.sort((a, b) => layout.indexOf(a) - layout.indexOf(b));
        }
        return acc;
    }, []);

    if (!keyList || !keyList.length) return;

    console.log('### ErrorPanel::keyList:: ', keyList);

    // Create array of error messages to display
    const errorMessages = keyList.map(key => {
        // Get translation for field type
        const errorKey: string = mapFieldKey(key, i18n);
        // Get corresponding error msg
        const errorMsg = hasOwnProperty(errors[key], 'errorI18n') ? errors[key].errorI18n : i18n.get(errors[key].errorMessage);

        return `${errorKey} ${errorMsg}`;
    });

    // const errorMessages: string[] = Object.entries(errors).reduce((acc, [key, value]) => {
    //     const val = (value as unknown) as FieldError;
    //
    //     if (val) {
    //         // console.log('\n### ErrorPanel::layout:: ', layout);
    //         // console.log('### ErrorPanel::key:: ', key);
    //         // console.log('### ErrorPanel::value:: ', value);
    //
    //         // Get translation for field type
    //         const errorKey: string = mapFieldKey(key, i18n);
    //
    //         const errorMsg = hasOwnProperty(val, 'errorI18n') ? val.errorI18n : i18n.get(val.errorMessage);
    //
    //         const errorStr = `${errorKey} ${errorMsg}`;
    //
    //         // Create array of active errors, ordered according to passed layout
    //         fieldList.push(key);
    //
    //         fieldList.sort(function(a, b) {
    //             return layout.indexOf(a) - layout.indexOf(b);
    //         });
    //
    //         //
    //         acc.push(errorStr);
    //
    //         // acc.sort(function(a, b) {
    //         //     return layout.indexOf(a) - layout.indexOf(b);
    //         // });
    //     }
    //
    //     return acc;
    // }, []);

    if (!errorMessages.length) {
        return null;
    }

    console.log('### ErrorPanel::ErrorPanel:: errorMessages', errorMessages);

    // If pay button has just been pressed - we will set focus on the first field in error
    focusFn(keyList[0]);

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
