import { Component, h } from 'preact';
import InputBase from './InputBase';

class InputTelephone extends Component {
    render() {
        return <InputBase {...this.props} type="tel" />;
    }
}

export default InputTelephone;
