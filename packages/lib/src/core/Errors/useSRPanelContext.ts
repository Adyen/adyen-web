import { useContext } from 'preact/hooks';
import { ISRPanelContext, SRPanelContext } from './SRPanelContext';

function useSRPanelContext(): ISRPanelContext {
    return useContext(SRPanelContext);
}

export default useSRPanelContext;
