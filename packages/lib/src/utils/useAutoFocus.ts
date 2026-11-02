import { useRef, useEffect } from 'preact/hooks';

const useAutoFocus = <T extends HTMLElement = HTMLElement>() => {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return ref;
};

export default useAutoFocus;
