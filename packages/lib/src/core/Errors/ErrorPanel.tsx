import { h } from 'preact';
import './ErrorPanel.scss';

export interface ErrorPanelObj {
    errorMessages: string[];
    fieldList: string[];
}

export interface ErrorPanelProps {
    id?: string;
    heading?: string;
    errors: ErrorPanelObj;
    callbackFn: (who) => void;
}

export function ErrorPanel({ id = 'ariaConsolidatedErrorField', heading = 'Errors:', errors, callbackFn = () => {} }: ErrorPanelProps) {
    if (!errors) return null;

    const { errorMessages } = errors;

    // console.log('### ErrorPanel:: errorMessages', errorMessages);
    // console.log('### ErrorPanel:: fieldList', errors.fieldList);

    // Perform passed callback, if specified
    callbackFn(errors);

    return (
        <div className="adyen-checkput__error-panel" id={id} aria-live="polite">
            {/*<div className="sr-only" id={id} aria-live="polite">*/}
            <div className="adl-alert adl-alert--error">
                <div className="adl-alert__header">
                    <span className="adl-alert__icon">
                        <i className="adl-icon-triangle"></i>
                    </span>
                    <span className="adl-alert__title">{heading}</span>
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
