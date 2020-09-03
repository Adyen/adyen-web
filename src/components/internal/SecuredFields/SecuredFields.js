import { Component, h } from 'preact';
//import handlers from './handlers';
import SecuredFieldsProvider from './SecuredFieldsProvider';

class SecuredFields extends Component {
    constructor(props) {
        super(props);

        // Add as a prop when declaring SecuredFieldsProvider
        //        this.handleOnError = handlers.handleOnError.bind(this);
    }

    static defaultProps = {
        onChange: () => {},
        onError: () => {}
    };

    componentDidMount() {
        this.setFocusOn = this.sfp.setFocusOn;
        this.updateStyles = this.sfp.updateStyles;
        this.showValidation = this.sfp.showValidation;
        this.processBinLookupResponse = this.sfp.processBinLookupResponse;
    }

    componentDidUpdate() {
        this.props.onChange(this.state);
    }

    componentWillUnmount() {
        this.sfp.destroy();
        this.sfp = null;
    }

    getChildContext() {
        return { i18n: this.props.i18n };
    }

    handleSecuredFieldsRef = ref => {
        this.sfp = ref;
    };

    handleSecuredFieldsChange = sfpState => {
        this.setState({ ...sfpState, isValid: sfpState.isSfpValid });
    };

    render() {
        return (
            <SecuredFieldsProvider
                ref={this.handleSecuredFieldsRef}
                {...this.props}
                onChange={this.handleSecuredFieldsChange}
                //                onError={this.handleOnError}
                render={() => null}
            />
        );
    }
}

export default SecuredFields;
