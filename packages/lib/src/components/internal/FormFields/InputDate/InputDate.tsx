import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import InputBase, { InputBaseProps } from '../InputBase';
import { checkDateInputSupport, formatDate } from './utils';

interface InputDateProps extends InputBaseProps {
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
