import { useCallback, useEffect, useState } from 'preact/hooks';

function isTabletWidthOrSmaller() {
    return window.matchMedia('(max-width: 1024px)').matches;
}

const useIsMobile = () => {
    const [isMobileScreenSize, setIsMobileScreenSize] = useState(isTabletWidthOrSmaller());

    const handleWindowResize = useCallback(() => {
        const isMobileScreenSize = isTabletWidthOrSmaller();
        setIsMobileScreenSize(isMobileScreenSize);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [handleWindowResize]);

    return { isMobileScreenSize };
};

export { useIsMobile };
