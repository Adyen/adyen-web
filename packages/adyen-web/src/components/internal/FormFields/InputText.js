import { Component, h } from 'preact';
import InputBase from './InputBase';

class InputText extends Component {
    static defaultProps = {};

    render() {
        return <InputBase classNameModifiers={['large']} {...this.props} type="text" />;
    }
}

export default InputText;
