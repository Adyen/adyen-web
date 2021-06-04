import { h, toChildArray } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { CoreContext } from './CoreContext';
import Language from '../../language/Language';

interface CoreProviderProps {
    loadingContext: string;
    i18n: Language;
    children?: any;
}

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */
function CoreProvider({ children, i18n = new Language(), loadingContext }: CoreProviderProps) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        i18n.loaded.then(() => {
            setLoaded(true);
        });
    }, [i18n.locale]);

    if (loaded) {
        return <CoreContext.Provider value={{ i18n: i18n, loadingContext: loadingContext }}>{toChildArray(children)}</CoreContext.Provider>;
    }

    return null;
}

export default CoreProvider;
