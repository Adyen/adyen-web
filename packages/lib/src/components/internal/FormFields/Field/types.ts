import { h, Component, ComponentChildren } from 'preact';
import Language from '../../../../language';

export interface FieldProps {
    name: string;
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
    showValidIcon?: boolean;
    useLabelElement?: boolean;
    addContextualElement?: boolean;
    i18n?: Language;
    errorVisibleToScreenReader?: boolean;
    renderAlternativeToLabel?: (defaultWrapperProps, children, uniqueId) => any;
}

export interface FieldState {
    disabled?: boolean;
    filled?: boolean;
    focused?: boolean;
}
