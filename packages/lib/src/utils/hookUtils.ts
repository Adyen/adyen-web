import { useRef, useEffect } from 'preact/hooks';

export function usePrevious<T>(value: T): T {
    const ref: any = useRef<T>();

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value
    return ref.current;
}
