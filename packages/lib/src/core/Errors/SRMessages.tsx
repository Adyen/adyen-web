import { h, Fragment } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { SRMessagesProps } from './types';

// An interface for the members exposed by SRMessages to its parent
export interface SRMessagesRef {
    setMessages?: (who) => void;
}

// TODO set type SRMessagesProps
export function SRMessages({ setComponentRef }: SRMessagesProps) {
    const messagesRef = useRef<SRMessagesRef>({});
    // Just call once to create the object by which we expose the members expected by the parent comp
    if (!Object.keys(messagesRef.current).length) {
        setComponentRef?.(messagesRef.current);
    }

    const [messages, setMessages] = useState(null);

    // Expose method expected by (parent) PersonalDetails.tsx
    messagesRef.current.setMessages = (msgs: string[]) => {
        setMessages(msgs);
    };

    return messages ? (
        <Fragment>
            {messages.map(msg => (
                <div key={msg} className="adyen-checkout-sr-panel__msg">
                    {msg}
                </div>
            ))}
        </Fragment>
    ) : null;
}
