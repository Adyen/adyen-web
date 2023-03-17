import { h } from 'preact';
import { SRPanelContext } from './SRPanelContext';
import useCoreContext from '../Context/useCoreContext';
import { partial } from '../../components/internal/SecuredFields/lib/utilities/commonUtils';
import { setSRMessagesFromErrors } from './utils';

// TODO - add Types

const SRPanelProvider = ({ srPanel, children }) => {
    const { i18n } = useCoreContext();

    // Helper fns
    const setSRMessagesFromObjects = ({ fieldTypeMappingFn }) => {
        return partial(setSRMessagesFromErrors, {
            SRPanelRef: srPanel,
            i18n,
            fieldTypeMappingFn
        });
    };

    const setSRMessagesFromStrings = strs => {
        srPanel.setMessages(strs);
    };

    const clearSRPanel = () => {
        srPanel.setMessages(null);
    };

    const shouldMoveFocusSR = srPanel.moveFocus;

    return (
        <SRPanelContext.Provider value={{ srPanel, setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR }}>
            {children}
        </SRPanelContext.Provider>
    );
};

export default SRPanelProvider;
