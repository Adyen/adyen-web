import { h } from 'preact';
import { SelectProps } from './types';
import ComboboxSelect from './ComboboxSelect';
import SelectOnly from './SelectOnly';
import './Select.scss';

function Select(props: Readonly<SelectProps>) {
    if (props.filterable) return <ComboboxSelect {...props} />;
    return <SelectOnly {...props} />;
}

Select.defaultProps = {
    className: '',
    classNameModifiers: [],
    filterable: true,
    items: [],
    readonly: false,
    onChange: () => {}
};

export default Select;
