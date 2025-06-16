import { useCallback, useRef, useState, useEffect } from 'preact/hooks';

export function useTooltip<T extends HTMLElement = HTMLElement>(delay: number) {
    const [visible, setVisible] = useState(false);
    const anchorRef = useRef<T>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const showTooltip = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setVisible(true), delay);
    }, [delay]);

    const hideTooltip = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setVisible(false), delay);
    }, [delay]);

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    return {
        anchorRef,
        visible,
        showTooltip,
        hideTooltip
    };
}
