import { h, Fragment } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { SRMessagesProps } from './types';

// An interface for the members exposed by SRMessages to its parent
export interface SRMessagesRef {
    setMessages?: (who: string[]) => void;
}

export function SRMessages({ setComponentRef }: Readonly<SRMessagesProps>) {
    const messagesRef = useRef<SRMessagesRef>({});
    // Just call once to create the object by which we expose the members expected by the parent comp
    if (!Object.keys(messagesRef.current).length) {
        setComponentRef?.(messagesRef.current);
    }

    const [messages, setMessages] = useState(null);

    // Pairs with "never clear": if the panel is never emptied, re-writing the message that is
    // already displayed would diff to nothing and the AT would stay silent. Bumping the key
    // remounts the nodes so the change is observable.
    //
    // Only bump when the incoming messages are identical to what is rendered, so a partial
    // change (one validation error replaced by another) still diffs granularly and announces
    // just the new entry instead of re-reading the whole list.
    const renderedRef = useRef<string[]>(null);
    const versionRef = useRef(0);
    const [version, setVersion] = useState(0);

    // Expose method expected by parent
    messagesRef.current.setMessages = (msgs: string[]) => {
        const rendered = renderedRef.current;
        const isDuplicate = !!msgs?.length && rendered?.length === msgs.length && rendered.every((m, i) => m === msgs[i]);

        if (isDuplicate) {
            versionRef.current += 1;
            setVersion(versionRef.current);
        }

        setMessages(msgs);
    };

    // Track what is committed to the DOM rather than the latest pending state: a clear followed
    // by a re-set in the same tick batches into one render, which would hide the duplicate.
    renderedRef.current = messages;

    return messages ? (
        <Fragment>
            {messages.map(msg => {
                return (
                    <div
                        key={`${version}-${msg}`}
                        className="adyen-checkout-sr-panel__msg"
                        {...(process.env.NODE_ENV !== 'production' && { 'data-testid': msg })}
                    >
                        {msg}
                    </div>
                );
            })}
        </Fragment>
    ) : null;
}
