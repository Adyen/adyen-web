import { h } from 'preact';
import InputBase from './InputBase';

export default function InputText(props) {
    /* Type of input base is always text, which is combined with using inputmode to change mobile keyboards.
     * This gives the most consistent and performant mobile input experience.
     */
    return <InputBase classNameModifiers={['large']} {...props} aria-required={props.required} type="text" />;
}
