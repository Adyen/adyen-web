import { h, Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { SRMessagesProps } from './types';

// An interface for the members exposed by SRMessages to its parent
export interface SRMessagesRef {
    setMessages?: (who: string[]) => void;
}

export function SRMessages({ setComponentRef }: SRMessagesProps) {
    const messagesRef = useRef<SRMessagesRef>({});

    const [messages, setMessages] = useState(null);

    useEffect(() => {
        // Should just call once, to create the object by which we expose the members expected by the parent comp
        setComponentRef(messagesRef.current);
        // Expose method expected by parent
        messagesRef.current.setMessages = (msgs: string[]) => setMessages(msgs);
    }, [setComponentRef]);

    return messages ? (
        <Fragment>
            {messages.map(msg => {
                return (
                    <div key={msg} className="adyen-checkout-sr-panel__msg" {...(process.env.NODE_ENV !== 'production' && { 'data-testid': msg })}>
                        {msg}
                    </div>
                );
            })}
        </Fragment>
    ) : null;
}
