import { h, Fragment, Component } from 'preact';
import './SRPanel.scss';
import { SRPanelProps, SRPanelRef } from './types';
import { useRef } from 'preact/hooks';

/**
 * A panel meant to hold errors that will be read out by ScreenReaders on an aria-live="polite" basis
 * Expects a string or string array of message to add to the panel to be read out
 * For testing purposes can be made visible
 */
// export function SRPanel({ id = 'ariaLiveSRPanel', errors, showPanel = false, setComponentRef }: SRPanelProps) {
//     const srPanelRef = useRef<SRPanelRef>({});
//     // Just call once to create the object by which we expose the members expected by the parent PersonalDetails comp
//     // if (!Object.keys(srPanelRef.current).length) {
//     //     setComponentRef(srPanelRef.current);
//     // }
//
//     let errorMessages = null;
//     if (errors) {
//         // Ensure errorMessages is an array
//         errorMessages = Array.isArray(errors) ? errors : [errors];
//     }
//
//     srPanelRef.current.setErrors = errs => {
//         console.log('### SRPanel::setErrors:: errs=', errs);
//         if (errs) {
//             // Ensure errorMessages is an array
//             errorMessages = Array.isArray(errs) ? errs : [errs];
//         }
//     };
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
        this.showPanel = true;
    }

    public setErrors = errors => {
        // Ensure errorMessages is an array
        this.setState({ errorMessages: Array.isArray(errors) ? errors : [errors] });
    };

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
