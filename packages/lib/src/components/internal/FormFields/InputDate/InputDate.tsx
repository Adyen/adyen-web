import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import InputBase from '../InputBase';
import { checkDateInputSupport, formatDate } from './utils';

interface InputDateProps {
    onInput?: (e) => void;
}

export default function InputDate(props: InputDateProps) {
    const isDateInputSupported = useMemo(checkDateInputSupport, []);

    const handleInput = e => {
        const { value } = e.target;
        e.target.value = formatDate(value);
        props.onInput(e);
    };

    if (isDateInputSupported) {
        return <InputBase {...props} type="date" />;
    }

    return <InputBase {...props} onInput={handleInput} maxLength={10} />;
}
