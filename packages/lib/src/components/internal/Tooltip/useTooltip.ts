import { useCallback, useRef, useState, useEffect } from 'preact/hooks';

export function useTooltip(delay = 100) {
    const [visible, setVisible] = useState(false);
    const anchorRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const show = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setVisible(true), delay);
    }, [delay]);

    const hide = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setVisible(false), delay);
    }, [delay]);

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    return {
        anchorRef,
        visible,
        show,
        hide
    };
}
