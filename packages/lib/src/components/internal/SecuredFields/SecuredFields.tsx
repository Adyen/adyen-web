import { Component, h } from 'preact';
import SecuredFieldsProvider from './SecuredFieldsProvider';
import Language from '../../../language/Language';

interface SecuredFieldsProps {
    onChange: (data) => void;
    i18n: Language;
}

class SecuredFields extends Component<SecuredFieldsProps> {
    private setFocusOn: any;
    private updateStyles: any;
    private showValidation: any;
    private processBinLookupResponse: any;
    private sfp: any;

    constructor(props) {
        super(props);
    }

    public static defaultProps = {
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

    public handleSecuredFieldsRef = ref => {
        this.sfp = ref;
    };

    public handleSecuredFieldsChange = sfpState => {
        this.setState({ ...sfpState, isValid: sfpState.isSfpValid });
    };

    render() {
        return (
            <SecuredFieldsProvider ref={this.handleSecuredFieldsRef} {...this.props} onChange={this.handleSecuredFieldsChange} render={() => null} />
        );
    }
}

export default SecuredFields;
