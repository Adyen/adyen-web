import { useCallback, useRef, useEffect } from 'preact/hooks';
import { TooltipController } from './TooltipController';
// todo: remove
function useTooltip<T extends HTMLElement = HTMLElement>(delay: number, tooltipText: string) {
    const anchorRef = useRef<T>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const showTooltip = useCallback(
        (text: string) => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => TooltipController.showTooltip({ text }), delay);
        },
        [delay]
    );

    const hideTooltip = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => TooltipController.hideTooltip(), delay);
    }, [delay]);

    useEffect(() => {
        //TooltipController.renderGlobalTooltip();

        return () => {
            //TooltipController.unmountGlobalTooltip();
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return {
        anchorRef,
        showTooltip,
        hideTooltip
    };
}
