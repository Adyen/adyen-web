import { h } from 'preact';
import InputBase from './InputBase';

export default function InputText(props) {
    return <InputBase classNameModifiers={['large']} {...props} type="text" />;
}
