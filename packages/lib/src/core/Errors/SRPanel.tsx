import { h, Fragment } from 'preact';
import './SRPanel.scss';
import { SRPanelProps } from './types';
import BaseElement from '../../components/BaseElement';
import { objectsDeepEqual } from '../../components/internal/SecuredFields/lib/utilities/commonUtils';

/**
 * A panel meant to hold messages that will be read out by ScreenReaders on an aria-live="polite" basis
 * Expects a string or string array of message to add to the panel to be read out
 * For testing purposes can be made visible
 */
export class SRPanel extends BaseElement<SRPanelProps> {
    public static defaultProps = {
        enabled: true,
        node: 'body',
        showPanel: process.env.NODE_ENV !== 'production'
    };

    private srPanelContainer = null;

    private readonly id;
    private readonly showPanel;

    constructor(props: SRPanelProps) {
        super(props);
        this.id = 'ariaLiveSRPanel';
        this.showPanel = this.props.showPanel;
        this.state = { panelMessages: null };

        console.log('### SRPanel::constructor:: this.props=', this.props);

        if (this.props.enabled) {
            if (document.querySelector(this.props.node)) {
                this.srPanelContainer = document.createElement('div');
                this.srPanelContainer.className = 'srPanel-holder';
                document.querySelector(this.props.node).appendChild(this.srPanelContainer);
                this.mount(this.srPanelContainer);
            } else {
                throw new Error('Component could not mount. Root node was not found.');
            }
        }
    }

    // A method we can expose to allow comps to set messages in this panel
    public setMessages = (messages: string[] | string): void => {
        if (!this.props.enabled) return;

        let panelMessages = null;
        if (messages) {
            // Ensure panelMessages is an array
            panelMessages = Array.isArray(messages) ? messages : [messages];
        }

        const oldMessages = this.state.panelMessages;

        this.setState({ panelMessages });

        // "re-render" if we have a new set of messages
        const hasNewMessages = !objectsDeepEqual(oldMessages, panelMessages);
        if (hasNewMessages) {
            this.mount(this._node);
        }
    };

    render() {
        console.log('### SRPanel::render:: ');
        return (
            <div
                className={this.showPanel ? 'adyen-checkout-sr-panel' : 'adyen-checkout-sr-panel--sr-only'}
                id={this.id}
                aria-live={'polite'}
                aria-atomic={'true'}
            >
                {this.state.panelMessages && (
                    <Fragment>
                        {this.state.panelMessages.map(msg => (
                            <div key={msg} className="adyen-checkout-sr-panel__msg">
                                {msg}
                            </div>
                        ))}
                    </Fragment>
                )}
            </div>
        );
    }
}
