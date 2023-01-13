import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import './ErrorPanel.scss';

export interface ErrorPanelObj {
    errorMessages: string[];
    fieldList: string[];
    errorCodes: string[];
}

export interface ErrorPanelProps {
    id?: string;
    heading?: string;
    errors: ErrorPanelObj;
    // callbackFn?: (who) => void;
    showPanel?: boolean;
}

export function ErrorPanel({
    id = 'ariaConsolidatedErrorField',
    // heading = 'Errors:',
    errors,
    // callbackFn = null,
    showPanel = false
}: ErrorPanelProps) {
    // if (!errors) return null;

    const { errorMessages } = errors ?? {};
    // console.log('### ErrorPanel::errors:: ', errors);

    // Perform passed callback, if specified & errors exist
    // useEffect(() => {
    //     if (errors) {
    //         callbackFn?.(errors);
    //     }
    // }, [errors]);

    return (
        <div
            className={showPanel ? 'adyen-checkout-error-panel' : 'adyen-checkout-error-panel--sr-only'}
            id={id}
            aria-live={'polite'}
            aria-atomic={'true'}
        >
            {errorMessages && (
                <div className="adyen-checkout-error-panel__wrapper">
                    {/*<div className="adyen-checkout-error-panel__header">*/}
                    {/*    <span className="adyen-checkout-error-panel__title">{heading}</span>*/}
                    {/*</div>*/}
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
