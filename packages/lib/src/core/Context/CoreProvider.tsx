import { h, toChildArray, createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { Resources } from './Resources';
import Language from '../../language';
import type { ComponentChildren } from 'preact';

interface CoreProviderProps {
    loadingContext: string;
    i18n: Language;
    resources: Resources;
    children: ComponentChildren;
}

type ContextValue = {
    i18n: Language;
    loadingContext: string;
    resources: Resources;
};

const CoreContext = createContext<ContextValue | undefined>(undefined);

const CoreProvider = ({ i18n, loadingContext, resources, children }: CoreProviderProps) => {
    useEffect(() => {
        if (!i18n || !loadingContext || !resources) {
            console.warn(
                `CoreProvider - WARNING core provider is missing:${i18n ? '' : 'i18n'} ${loadingContext ? '' : 'loadingContext'} ${resources ? '' : 'resources'}`
            );
        }
    }, [i18n, loadingContext, resources]);

    return (
        <CoreContext.Provider
            value={{
                i18n,
                loadingContext,
                resources
            }}
        >
            {toChildArray(children)}
        </CoreContext.Provider>
    );
};

const useCoreContext = (): ContextValue => {
    const context = useContext(CoreContext);

    if (context === undefined) {
        throw new Error('"useCoreContext" must be used within a CoreProvider');
    }

    return context;
};

export { CoreProvider, useCoreContext };
