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
    callbackFn?: (who) => void;
    showPanel?: boolean;
}

export function ErrorPanel({
    id = 'ariaConsolidatedErrorField',
    heading = 'Errors:',
    errors,
    callbackFn = null,
    showPanel = false
}: ErrorPanelProps) {
    if (!errors) return null;

    const { errorMessages } = errors;

    // Perform passed callback, if specified
    callbackFn?.(errors);

    return (
        <div className={showPanel ? 'adyen-checkout-error-panel' : 'adyen-checkout-error-panel--sr-only'} id={id} aria-live="polite">
            <div className="adl-alert adl-alert--error">
                <div className="adl-alert__header">
                    <span className="adl-alert__icon">
                        <i className="adl-icon-triangle"></i>
                    </span>
                    <span className="adl-alert__title adyen-checkout-error-panel__title">{heading}</span>
                </div>
                {errorMessages.map(error => (
                    <div key={error} className="adl-alert__explanation adyen-checkout-error-panel__error">
                        {error}
                    </div>
                ))}
            </div>
        </div>
    );
}
