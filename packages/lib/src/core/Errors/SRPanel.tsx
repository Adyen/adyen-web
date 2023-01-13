import { h } from 'preact';
import './SRPanel.scss';

export interface SortedErrorObject {
    field: string;
    errorMessage: string;
    errorCode: string;
}

export interface SRPanelProps {
    id?: string;
    errors: string | string[];
    showPanel?: boolean;
}

/**
 * A panel meant to hold errors that will be read out by ScreenReaders on an aria-live="polite" basis
 * Expects a string or string array of message to add to the panel to be read out
 * For testing purposes can be made visible
 */
export function SRPanel({ id = 'ariaLiveSRPanel', errors, showPanel = false }: SRPanelProps) {
    const errorMessages = Array.isArray(errors) ? errors : [errors];
    return (
        <div className={showPanel ? 'adyen-checkout-sr-panel' : 'adyen-checkout-sr-panel--sr-only'} id={id} aria-live={'polite'} aria-atomic={'true'}>
            {errorMessages && (
                <div className="adyen-checkout-sr-panel__wrapper">
                    {errorMessages.map(error => (
                        <div key={error} className="adyen-checkout-sr-panel__error">
                            {error}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
