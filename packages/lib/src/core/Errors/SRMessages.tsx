import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { SRMessagesProps } from './types';

// An interface for the members exposed by SRMessages to its parent
export interface SRMessagesRef {
    setMessages?: (who: string[]) => void;
}

export function SRMessages({ setComponentRef, customAria }: SRMessagesProps) {
    const messagesRef = useRef<SRMessagesRef>({});
    // Just call once to create the object by which we expose the members expected by the parent comp
    if (!Object.keys(messagesRef.current).length) {
        setComponentRef?.(messagesRef.current);
    }

    const [messages, setMessages] = useState(null);

    // Expose method expected by parent
    messagesRef.current.setMessages = (msgs: string[]) => {
        setMessages(msgs);
    };

    return messages ? (
        <div role={'log'} {...customAria}>
            {messages.map(msg => {
                return (
                    <div key={msg} className="adyen-checkout-sr-panel__msg" {...(process.env.NODE_ENV !== 'production' && { 'data-testid': msg })}>
                        {msg}
                    </div>
                );
            })}
        </div>
    ) : null;
}
