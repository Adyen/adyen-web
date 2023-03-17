import { createContext } from 'preact';

// TODO - add Types

export const SRPanelContext = createContext({
    srPanel: null,
    setSRMessagesFromObjects: null,
    setSRMessagesFromStrings: null,
    clearSRPanel: null,
    shouldMoveFocusSR: null
});
