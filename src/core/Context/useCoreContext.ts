import { useContext } from 'preact/hooks';
import { CoreContext } from '~/core/Context/CoreContext';

function useCoreContext() {
    return useContext(CoreContext);
}

export default useCoreContext;
