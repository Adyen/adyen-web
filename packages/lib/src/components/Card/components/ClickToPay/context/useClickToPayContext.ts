import { useContext } from 'preact/hooks';
import { ClickToPayContext } from './ClickToPayContext';

function useClickToPayContext() {
    return useContext(ClickToPayContext);
}

export default useClickToPayContext;
