import { h, Fragment } from 'preact';
import './SRPanel.scss';
import { SRPanelProps } from './types';

/**
 * A panel meant to hold errors that will be read out by ScreenReaders on an aria-live="polite" basis
 * Expects a string or string array of message to add to the panel to be read out
 * For testing purposes can be made visible
 */
export function SRPanel({ id = 'ariaLiveSRPanel', errors, showPanel = false }: SRPanelProps) {
    let errorMessages = null;
    if (errors) {
        // Ensure errorMessages is an array
        errorMessages = Array.isArray(errors) ? errors : [errors];
    }

    return (
        <div className={showPanel ? 'adyen-checkout-sr-panel' : 'adyen-checkout-sr-panel--sr-only'} id={id} aria-live={'polite'} aria-atomic={'true'}>
            {errorMessages && (
                <Fragment>
                    {errorMessages.map(error => (
                        <div key={error} className="adyen-checkout-sr-panel__error">
                            {error}
                        </div>
                    ))}
                </Fragment>
            )}
        </div>
    );
}
