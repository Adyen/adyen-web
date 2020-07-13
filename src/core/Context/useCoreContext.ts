import { useContext } from 'preact/hooks';
import { CoreContext } from './CoreContext';

function useCoreContext() {
    return useContext(CoreContext);
}

export default useCoreContext;
