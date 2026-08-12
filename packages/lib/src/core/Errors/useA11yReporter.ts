import { useEffect } from 'preact/hooks';
import useSRPanelContext from './useSRPanelContext';

export const useA11yReporter = (statusMessage): void => {
    const { srPanel } = useSRPanelContext();

    useEffect(() => {
        if (!srPanel) return;
        srPanel.setAriaProps({ 'aria-relevant': 'additions text' });
        return () => {
            // Deliberately does not clear the panel. The panel is shared, so clearing on unmount
            // destroys whatever is on display -- often a message another component just wrote --
            // and truncates our own message before a screen reader has had time to read it.
            // A status message stays until something supersedes it.
            srPanel.setAriaProps({ 'aria-relevant': srPanel.constructor['defaultProps'].ariaAttributes['aria-relevant'] });
        };
    }, [srPanel]);

    useEffect(() => {
        if (!srPanel) return;
        srPanel.setMessages(statusMessage);
    }, [srPanel, statusMessage]);
};
