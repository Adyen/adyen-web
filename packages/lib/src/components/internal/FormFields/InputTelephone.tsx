import { h } from 'preact';
import InputBase from './InputBase';

export default function InputTelephone(props) {
    return <InputBase {...props} type="tel" />;
}
