import { Component, h, toChildArray } from 'preact';
import { CoreContext } from './CoreContext';
import { Resources } from './Resources';

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

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */
class CoreProvider extends Component<CoreProviderProps> {
    public state = {
        loaded: false
    };

    componentDidMount() {
        if (this.props.i18n) {
            this.props.i18n.loaded.then(() => {
                this.setState({ loaded: true });
            });
        } else {
            this.setState({ loaded: true });
        }
        if (!this.props.i18n || !this.props.loadingContext || !this.props.resources) {
            console.error('CoreProvider - WARNING core provider is missing one of the following: i18n, loadingContext or resources');
        }
    }

    render({ children }: CoreProviderProps) {
        if (this.state.loaded) {
            return (
                <CoreContext.Provider
                    value={{
                        i18n: this.props.i18n,
                        loadingContext: this.props.loadingContext,
                        commonProps: this.props.commonProps || {},
                        resources: this.props.resources
                    }}
                >
                    {toChildArray(children)}
                </CoreContext.Provider>
            );
        }

        return null;
    }
}

export default CoreProvider;
