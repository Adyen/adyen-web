import { h } from 'preact';
import { act, render, screen, waitFor } from '@testing-library/preact';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { SRPanel } from './SRPanel';
import { SRPanelContext } from './SRPanelContext';
import { useA11yReporter } from './useA11yReporter';
import { setSRMessagesFromErrors } from './utils';

/**
 * Semantics for the shared SR panel, agreed while investigating PR #4098.
 *
 * The panel is a singleton written to by two unrelated families of consumer:
 *   - status reporters (LoadingWrapper, Await, QRLoader, Countdown, ...) via useA11yReporter
 *   - error reporters (Card/Giftcard/OpenInvoice validation) via setSRMessagesFromErrors
 *
 * Agreed rules:
 *   1. A write always wins and takes ownership (last-writer-wins).
 *   2. A clear is only honoured if the caller still owns what is displayed.
 *   3. A status reporter unmounting does NOT clear; the message stays until superseded.
 *
 * These tests assert the DOM mutations the live region actually emits, because that -- not
 * the fact that setMessages was called -- is what a screen reader observes.
 */

const core = setupCoreMock();

// The panel is mounted onto document.body by SRPanel itself, not into a render container.
// It carries role="log", so it is reachable via a normal accessible query.
const getPanel = () => screen.getByRole('log');

/**
 * Let any pending state update commit. Required before asserting that something did NOT
 * change: waitFor resolves immediately when the assertion already holds, so it would pass
 * before a pending clear had a chance to flush.
 */
const flush = async () => {
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });
};

/** Records add/remove of message nodes in the live region. */
const watch = (panel: HTMLElement) => {
    const records: string[] = [];
    const observer = new MutationObserver(mutations =>
        mutations.forEach(m => {
            m.removedNodes.forEach(n => records.push(`-${n.textContent}`));
            m.addedNodes.forEach(n => records.push(`+${n.textContent}`));
        })
    );
    observer.observe(panel, { childList: true, subtree: true, characterData: true });
    return { records, stop: () => observer.disconnect() };
};

/**
 * Mimics the Card error hook running with no validation errors.
 * `hasDisplayedErrors` reflects whether this form currently has errors of its own on display.
 */
const errorHookWithNoErrors = (srPanel: SRPanel, hasDisplayedErrors = false) =>
    setSRMessagesFromErrors(
        { i18n: core.modules.i18n, fieldTypeMappingFn: null, SRPanelRef: srPanel },
        { errors: {}, isValidating: false, layout: null, countrySpecificLabels: null, hasDisplayedErrors }
    );

const StatusReporter = ({ message }: Readonly<{ message: string | null }>) => {
    useA11yReporter(message);
    return null;
};

const withPanel = (srPanel: SRPanel, message: string | null) => (
    <SRPanelContext.Provider value={{ srPanel } as never}>
        <StatusReporter message={message} />
    </SRPanelContext.Provider>
);

describe('SRPanel ownership semantics', () => {
    test('case 1: a status message survives a clear from the error hook that owns nothing', async () => {
        const srPanel = new SRPanel(core);
        const { records, stop } = watch(getPanel());

        srPanel.setMessages('Loading…');
        await waitFor(() => expect(getPanel().textContent).toBe('Loading…'));

        // Card re-renders with no validation errors and wipes the shared panel.
        errorHookWithNoErrors(srPanel);
        errorHookWithNoErrors(srPanel);

        await flush();
        expect(getPanel().textContent).toBe('Loading…');
        expect(records).toEqual(['+Loading…']);
        stop();
    });

    test('case 2: the error hook can still clear errors it owns', async () => {
        const srPanel = new SRPanel(core);
        const { stop } = watch(getPanel());

        srPanel.setMessages(['Card number invalid']);
        await waitFor(() => expect(getPanel().textContent).toBe('Card number invalid'));

        // The form has errors on display, so this clear is its own to make.
        errorHookWithNoErrors(srPanel, true);

        await waitFor(() => expect(getPanel().textContent).toBe(''));
        stop();
    });

    test('case 3: a new status message overrides errors already on display', async () => {
        const srPanel = new SRPanel(core);
        const { stop } = watch(getPanel());

        srPanel.setMessages(['Card number invalid']);
        await waitFor(() => expect(getPanel().textContent).toBe('Card number invalid'));

        render(withPanel(srPanel, 'Loading…'));

        await waitFor(() => expect(getPanel().textContent).toBe('Loading…'));
        stop();
    });

    test('case 4: a status reporter unmounting leaves its message in place', async () => {
        const srPanel = new SRPanel(core);
        const { stop } = watch(getPanel());

        const { unmount } = render(withPanel(srPanel, 'Loading…'));
        await waitFor(() => expect(getPanel().textContent).toBe('Loading…'));

        unmount();

        await flush();
        expect(getPanel().textContent).toBe('Loading…');
        stop();
    });

    test('case 5: one status reporter unmounting does not clear another reporter message', async () => {
        const srPanel = new SRPanel(core);
        const { stop } = watch(getPanel());

        const { unmount: unmountFirstReporter } = render(withPanel(srPanel, 'Awaiting your approval'));
        await waitFor(() => expect(getPanel().textContent).toBe('Awaiting your approval'));

        render(withPanel(srPanel, 'Loading…'));
        await waitFor(() => expect(getPanel().textContent).toBe('Loading…'));

        unmountFirstReporter();

        await flush();
        expect(getPanel().textContent).toBe('Loading…');
        stop();
    });

    test('case 7: the same validation error occurring twice is announced both times', async () => {
        const srPanel = new SRPanel(core);
        const { records, stop } = watch(getPanel());

        // Shopper submits, gets an error.
        srPanel.setMessages(['Card number invalid']);
        await waitFor(() => expect(getPanel().textContent).toBe('Card number invalid'));

        // Shopper edits the field, errors are recalculated as empty, then they submit again
        // and hit the very same error.
        errorHookWithNoErrors(srPanel, true);
        await flush();
        srPanel.setMessages(['Card number invalid']);
        await flush();

        // A screen reader only announces a DOM change, so the second occurrence must
        // produce its own mutation rather than diffing away to nothing.
        expect(records.filter(r => r === '+Card number invalid')).toHaveLength(2);
        stop();
    });

    test('case 8: a second component announcing the same status is still announced', async () => {
        const srPanel = new SRPanel(core);
        const { records, stop } = watch(getPanel());

        // Because unmounting no longer clears (case 4), "Loading…" is still on display when
        // the next component mounts and reports the very same status.
        const { unmount } = render(withPanel(srPanel, 'Loading…'));
        await waitFor(() => expect(getPanel().textContent).toBe('Loading…'));
        unmount();
        await flush();

        render(withPanel(srPanel, 'Loading…'));
        await flush();

        expect(records.filter(r => r === '+Loading…')).toHaveLength(2);
        stop();
    });

    test('case 6: a deliberate clear-then-rewrite by the same owner still emits a mutation', async () => {
        const srPanel = new SRPanel(core);
        const { records, stop } = watch(getPanel());

        srPanel.setMessages('10 seconds remaining');
        await waitFor(() => expect(getPanel().textContent).toBe('10 seconds remaining'));

        // CountdownA11yReporter clears then immediately rewrites on every tick.
        srPanel.setMessages(null);
        srPanel.setMessages('9 seconds remaining');

        await waitFor(() => expect(getPanel().textContent).toBe('9 seconds remaining'));
        expect(records).toContain('+9 seconds remaining');
        stop();
    });
});
