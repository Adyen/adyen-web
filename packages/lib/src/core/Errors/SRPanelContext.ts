import { createContext } from 'preact';
import { SRPanel } from './SRPanel';
import { SetSRMessagesReturnFn } from './SRPanelProvider';

export interface ISRPanelContext {
    srPanel: SRPanel;
    setSRMessagesFromObjects: ({ fieldTypeMappingFn }) => SetSRMessagesReturnFn;
    setSRMessagesFromStrings: (strs) => void;
    clearSRPanel: () => void;
    shouldMoveFocusSR: boolean;
}

export const SRPanelContext = createContext<ISRPanelContext>({
    srPanel: null,
    setSRMessagesFromObjects: null,
    setSRMessagesFromStrings: null,
    clearSRPanel: null,
    shouldMoveFocusSR: null
});
