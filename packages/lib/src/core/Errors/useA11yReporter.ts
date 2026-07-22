import { useEffect } from 'preact/hooks';
import useSRPanelContext from './useSRPanelContext';

export const useA11yReporter = (statusMessage): void => {
    const { srPanel } = useSRPanelContext();

    useEffect(() => {
        if (!srPanel) return;
        srPanel.setAriaProps({ 'aria-relevant': 'additions text' });
        return () => {
            srPanel.setMessages(null);
            srPanel.setAriaProps({ 'aria-relevant': srPanel.constructor['defaultProps'].ariaAttributes['aria-relevant'] });
        };
    }, [srPanel]);

    useEffect(() => {
        if (!srPanel) return;
        srPanel.setMessages(statusMessage);
    }, [srPanel, statusMessage]);
};
