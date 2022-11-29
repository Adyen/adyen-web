import { useContext } from 'preact/hooks';
import { ClickToPayContext, IClickToPayContext } from './ClickToPayContext';

function useClickToPayContext(): IClickToPayContext {
    return useContext(ClickToPayContext);
}

export default useClickToPayContext;
