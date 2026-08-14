import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Debugging aid for the screen reader panel. Toggle it from the Storybook toolbar
 * ("SR panel debugger"); it is mounted globally by .storybook/preview.tsx.
 *
 * Watches the SR panel live region and prints every DOM mutation on screen, so announcements
 * heard in a screen reader can be correlated against what actually changed in the DOM. A screen
 * reader only announces an actual change to the region, which makes "nothing was announced" and
 * "nothing changed" impossible to tell apart without a log like this.
 *
 * What to look for:
 *  - ATTR rows in red  = the attribute VALUE really changed. Changing a live region's own
 *                        attributes can make an AT re-register it and drop a queued announcement.
 *  - ATTR rows in grey = setAttribute called with an identical value (no-op write).
 *  - CHILD rows        = message text added/removed. No CHILD row means nothing was announced,
 *                        because aria-live only fires on an actual content change.
 *  - A message that is added and removed within a few milliseconds was very likely never read.
 */

const SR_PANEL_SELECTOR = '[class^="adyen-checkout-sr-panel"]';

interface LogEntry {
    id: number;
    t: string;
    kind: 'ATTR' | 'CHILD' | 'TEXT' | 'INFO';
    text: string;
    changed: boolean;
}

const COLORS: Record<LogEntry['kind'], string> = {
    ATTR: '#d32f2f',
    CHILD: '#2e7d32',
    TEXT: '#1565c0',
    INFO: '#777'
};

export const SRPanelDebugger = () => {
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const idRef = useRef(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let observer: MutationObserver;
        let cancelled = false;
        const start = performance.now();

        const push = (kind: LogEntry['kind'], text: string, changed = false) => {
            setEntries(prev =>
                [...prev, { id: idRef.current++, t: ((performance.now() - start) / 1000).toFixed(2) + 's', kind, text, changed }].slice(-200)
            );
        };

        // The SR panel is created by Core, so it may not exist on first paint.
        const waitForPanel = () => {
            if (cancelled) return;
            const panel = document.querySelector(SR_PANEL_SELECTOR);
            if (!panel) return void requestAnimationFrame(waitForPanel);

            push('INFO', `observing ${panel.className} [aria-relevant="${panel.getAttribute('aria-relevant')}"]`);

            observer = new MutationObserver(mutations => {
                mutations.forEach((m, i) => {
                    if (m.type === 'attributes') {
                        // MutationObserver only reports oldValue, and records arrive batched, so
                        // reading getAttribute() here returns the value AFTER the whole batch.
                        // The true new value is the oldValue of the next record for this same
                        // attribute/target, falling back to the current value for the last one.
                        const later = mutations
                            .slice(i + 1)
                            .find(n => n.type === 'attributes' && n.attributeName === m.attributeName && n.target === m.target);
                        const next = later ? later.oldValue : (m.target as HTMLElement).getAttribute(m.attributeName);
                        const changed = m.oldValue !== next;
                        push('ATTR', `${m.attributeName}: "${m.oldValue}" -> "${next}"${changed ? '' : '  (no-op write)'}`, changed);
                    } else if (m.type === 'characterData') {
                        push('TEXT', `"${m.oldValue}" -> "${m.target.textContent}"`, true);
                    } else {
                        m.removedNodes.forEach(n => push('CHILD', `- "${n.textContent}"`));
                        m.addedNodes.forEach(n => push('CHILD', `+ "${n.textContent}"`));
                    }
                });
            });

            observer.observe(panel, {
                attributes: true,
                attributeOldValue: true,
                childList: true,
                subtree: true,
                characterData: true,
                characterDataOldValue: true
            });
        };

        waitForPanel();

        return () => {
            cancelled = true;
            observer?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [entries]);

    return (
        <div
            style={{
                position: 'fixed',
                right: '12px',
                bottom: '12px',
                width: '440px',
                maxHeight: '45vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                border: '2px solid #333',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '11px',
                zIndex: 99999,
                boxShadow: '0 4px 16px rgba(0,0,0,.25)'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderBottom: '1px solid #ddd',
                    fontWeight: 'bold'
                }}
            >
                <span>SR panel mutations ({entries.length})</span>
                <button type="button" onClick={() => setEntries([])} style={{ fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer' }}>
                    clear
                </button>
            </div>
            <div ref={listRef} style={{ overflowY: 'auto', padding: '4px 8px' }}>
                {entries.length === 0 && <div style={{ color: '#999' }}>no mutations yet…</div>}
                {entries.map(e => (
                    <div key={e.id} style={{ color: COLORS[e.kind], fontWeight: e.changed ? 'bold' : 'normal', whiteSpace: 'pre-wrap' }}>
                        {e.t} {e.kind} {e.text}
                    </div>
                ))}
            </div>
        </div>
    );
};
