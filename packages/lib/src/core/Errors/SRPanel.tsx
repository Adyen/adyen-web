import { h, Fragment, Component } from 'preact';
import './SRPanel.scss';
import { SRPanelProps } from './types';

/**
 * A panel meant to hold errors that will be read out by ScreenReaders on an aria-live="polite" basis
 * Expects a string or string array of message to add to the panel to be read out
 * For testing purposes can be made visible
 */
// export function SRPanel({ id = 'ariaLiveSRPanel', errors, showPanel = false }: SRPanelProps) {
//     let errorMessages = null;
//     if (errors) {
//         // Ensure errorMessages is an array
//         errorMessages = Array.isArray(errors) ? errors : [errors];
//     }
//
//     return (
//         <div className={showPanel ? 'adyen-checkout-sr-panel' : 'adyen-checkout-sr-panel--sr-only'} id={id} aria-live={'polite'} aria-atomic={'true'}>
//             {errorMessages && (
//                 <Fragment>
//                     {errorMessages.map(error => (
//                         <div key={error} className="adyen-checkout-sr-panel__error">
//                             {error}
//                         </div>
//                     ))}
//                 </Fragment>
//             )}
//         </div>
//     );
// }

export class SRPanel extends Component<SRPanelProps> {
    private readonly id;
    private readonly showPanel;

    constructor(props: SRPanelProps) {
        super(props);
        this.id = props.id || 'ariaLiveSRPanel';
        this.showPanel = props.showPanel;
        this.state = { errorMessages: null };
    }

    // A method we can expose to allow comps to set errors in this panel
    public setErrors = (errors: string[] | string): void => {
        let errorMessages = null;
        if (errors) {
            errorMessages = Array.isArray(errors) ? errors : [errors];
        }
        // Ensure errorMessages is an array
        this.setState({ errorMessages });
    };

    // eslint-disable-next-line no-empty-pattern
    render({}, { errorMessages }) {
        return (
            <div
                className={this.showPanel ? 'adyen-checkout-sr-panel' : 'adyen-checkout-sr-panel--sr-only'}
                id={this.id}
                aria-live={'polite'}
                aria-atomic={'true'}
            >
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
}
