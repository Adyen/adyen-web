import { useContext } from 'preact/hooks';
import { ClickToPayContext, ClickToPayContextInterface } from './ClickToPayContext';

function useClickToPayContext(): ClickToPayContextInterface {
    return useContext(ClickToPayContext);
}

export default useClickToPayContext;
