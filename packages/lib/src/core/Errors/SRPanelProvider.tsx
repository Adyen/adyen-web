import { h, ComponentChildren } from 'preact';
import { SRPanelContext } from './SRPanelContext';
import useCoreContext from '../Context/useCoreContext';
import { partial } from '../../components/internal/SecuredFields/lib/utilities/commonUtils';
import { setSRMessagesFromErrors } from './utils';
import { SRPanel } from './SRPanel';
import { SetSRMessagesReturnObject } from './types';

type SRPanelProviderProps = {
    srPanel: SRPanel;
    children: ComponentChildren;
};

export type SetSRMessagesReturnFn = ({ errors, isValidating, layout, countrySpecificLabels }) => SetSRMessagesReturnObject;

const SRPanelProvider = ({ srPanel, children }: SRPanelProviderProps) => {
    const { i18n } = useCoreContext();

    // Helper fns
    const setSRMessagesFromObjects = ({ fieldTypeMappingFn }): SetSRMessagesReturnFn => {
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
