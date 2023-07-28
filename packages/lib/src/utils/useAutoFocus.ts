import { useRef, useEffect } from 'preact/hooks';

const useAutoFocus = () => {
    const ref = useRef(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return ref;
};

export default useAutoFocus;
