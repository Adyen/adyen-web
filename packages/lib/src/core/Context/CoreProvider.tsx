import { h, toChildArray } from 'preact';
import { CoreContext } from './CoreContext';
import { Resources } from './Resources';
import { useEffect } from 'preact/hooks';

interface CoreProviderProps {
    loadingContext: string;
    i18n: any;
    resources: Resources;
    children?: any;
    commonProps?: CommonPropsTypes;
}

export interface CommonPropsTypes {
    [key: string]: any;
}

const CoreProvider = ({ i18n, loadingContext, commonProps, resources, children }: CoreProviderProps) => {
    useEffect(() => {
        if (!i18n || !loadingContext || !resources) {
            console.error('CoreProvider - WARNING core provider is missing one of the following: i18n, loadingContext or resources');
        }
    }, [i18n, loadingContext, resources]);

    return (
        <CoreContext.Provider
            value={{
                i18n,
                loadingContext,
                commonProps: commonProps || {},
                resources
            }}
        >
            {toChildArray(children)}
        </CoreContext.Provider>
    );
};

export default CoreProvider;
