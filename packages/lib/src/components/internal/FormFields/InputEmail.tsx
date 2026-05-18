import { h } from 'preact';
import InputBase, { InputBaseProps } from './InputBase';

export default function InputEmail(props: Readonly<InputBaseProps>) {
    return <InputBase {...props} type="email" autoCapitalize="off" />;
}
