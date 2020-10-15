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
    }

    render({ children }: CoreProviderProps) {
        if (this.state.loaded) {
            return (
                <CoreContext.Provider value={{ i18n: this.props.i18n, loadingContext: this.props.loadingContext }}>
                    {toChildArray(children)}
                </CoreContext.Provider>
            );
        }

        return null;
    }
}

export default CoreProvider;
