import { createContext } from 'preact';
import { SRPanel } from './SRPanel';
import { SetSRMessagesReturnFn } from './SRPanelProvider';
import { FieldTypeMappingFn } from './types';

interface SetSRMessagesFromObjectsFnProps {
    fieldTypeMappingFn?: FieldTypeMappingFn;
}

type SetSRMessagesFromObjectsFn = (props: SetSRMessagesFromObjectsFnProps) => SetSRMessagesReturnFn;

export interface ISRPanelContext {
    srPanel: SRPanel | null;
    setSRMessagesFromObjects: SetSRMessagesFromObjectsFn | null;
    setSRMessagesFromStrings: ((strs) => void) | null;
    clearSRPanel: (() => void) | null;
    shouldMoveFocusSR: boolean | null;
}

// Will be needed once PersonalDetails & Address have ability to administer their own SRPanel
// export const mockSRContext: ISRPanelContext = {
//     srPanel: null,
//     setSRMessagesFromObjects: null,
//     setSRMessagesFromStrings: null,
//     clearSRPanel: null,
//     shouldMoveFocusSR: null
// };

export const SRPanelContext = createContext<ISRPanelContext>({
    srPanel: null,
    setSRMessagesFromObjects: null,
    setSRMessagesFromStrings: null,
    clearSRPanel: null,
    shouldMoveFocusSR: null
});
