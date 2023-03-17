import { useContext } from 'preact/hooks';
import { SRPanelContext } from './SRPanelContext';

function useSRPanelContext() {
    return useContext(SRPanelContext);
}

export default useSRPanelContext;
