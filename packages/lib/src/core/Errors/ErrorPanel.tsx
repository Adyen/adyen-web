import { h } from 'preact';
import './ErrorPanel.scss';

// export interface ErrorPanelObj {
//     errorMessages: string[];
//     fieldList: string[];
//     errorCodes: string[];
//     sortedErrors: sortedErrorObject[];
// }

export interface SortedErrorObject {
    field: string;
    errorMessage: string;
    errorCode: string;
}

export interface ErrorPanelProps {
    id?: string;
    heading?: string;
    errors: string | string[];
    showPanel?: boolean;
}

export function ErrorPanel({ id = 'ariaLiveSRPanel', errors, showPanel = false }: ErrorPanelProps) {
    const errorMessages = Array.isArray(errors) ? errors : [errors];
    return (
        <div
            className={showPanel ? 'adyen-checkout-error-panel' : 'adyen-checkout-error-panel--sr-only'}
            id={id}
            aria-live={'polite'}
            aria-atomic={'true'}
        >
            {errorMessages && (
                <div className="adyen-checkout-error-panel__wrapper">
                    {errorMessages.map(error => (
                        <div key={error} className="adyen-checkout-error-panel__error">
                            {error}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
