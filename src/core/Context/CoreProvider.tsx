import { Component, h, toChildArray } from 'preact';
import { CoreContext } from './CoreContext';

interface CoreProviderProps {
    loadingContext: string;
    i18n: any;
    children?: any;
}

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */
class CoreProvider extends Component<CoreProviderProps> {
    render({ children }: CoreProviderProps) {
        return (
            <CoreContext.Provider value={{ i18n: this.props.i18n, loadingContext: this.props.loadingContext }}>
                {toChildArray(children)}
            </CoreContext.Provider>
        );
    }
}

export default CoreProvider;
