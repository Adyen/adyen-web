import { h, Component, ComponentChildren } from 'preact';
import Language from '../../../../language';

export interface FieldProps {
    className?: string;
    classNameModifiers?: string[];
    children?: ComponentChildren;
    disabled?: boolean;
    errorMessage?: string | boolean;
    filled?: boolean;
    focused?: boolean;
    helper?: string;
    inputWrapperModifiers?: string[];
    isLoading?: boolean;
    isValid?: boolean;
    label?: string | Component;
    labelEndAdornment?: string | h.JSX.Element;
    onBlur?;
    onFocus?;
    onFocusField?;
    onFieldBlur?;
    dir?;
    name?: string;
    showValidIcon?: boolean;
    isCollatingErrors?: boolean;
    useLabelElement?: boolean;
    i18n?: Language;
    errorVisibleToScreenReader?: boolean;
}

export interface FieldState {
    disabled?: boolean;
    filled?: boolean;
    focused?: boolean;
}
