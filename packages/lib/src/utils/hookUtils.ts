import { useRef, useEffect } from 'preact/hooks';

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value
    return ref.current;
}
