import { h } from 'preact';
import InputBase from './InputBase';

export default function InputEmail(props) {
    return <InputBase {...props} type="email" autoCapitalize="off" />;
}
