import { useEffect } from 'preact/hooks';
import useSRPanelContext from './useSRPanelContext';

export const useA11yReporter = (statusMessage): void => {
    const { srPanel } = useSRPanelContext();

    useEffect(() => {
        srPanel.setAriaProps({ 'aria-relevant': 'additions text' });
        return () => {
            srPanel.setMessages(null);
            srPanel.setAriaProps({ 'aria-relevant': srPanel.constructor['defaultProps'].ariaAttributes['aria-relevant'] });
        };
    }, []);

    useEffect(() => {
        srPanel.setMessages(statusMessage);
    }, [statusMessage]);
};
