import { h, toChildArray, createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { Resources } from './Resources';
import Language from '../../language';

import type { ComponentChildren } from 'preact';
import type { AnalyticsModule } from '../../types/global-types';

interface CoreProviderProps {
    loadingContext: string;
    i18n: Language;
    resources: Resources;
    analytics: AnalyticsModule;
    children: ComponentChildren;
}

type ContextValue = {
    i18n: Language;
    loadingContext: string;
    resources: Resources;
    analytics: AnalyticsModule;
};

const CoreContext = createContext<ContextValue | undefined>(undefined);

const CoreProvider = ({ i18n, loadingContext, resources, analytics, children }: CoreProviderProps) => {
    useEffect(() => {
        if (!i18n || !loadingContext || !resources || !analytics) {
            console.warn(
                `CoreProvider - WARNING core provider is missing:${i18n ? '' : 'i18n'} ${loadingContext ? '' : 'loadingContext'} ${resources ? '' : 'resources'} ${analytics ? '' : 'analytics'}`
            );
        }
    }, [i18n, loadingContext, resources, analytics]);

    return (
        <CoreContext.Provider
            value={{
                i18n,
                loadingContext,
                resources,
                analytics
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
