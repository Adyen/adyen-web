import { Component, ComponentChildren } from 'preact';

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
    onBlur?;
    onFocus?;
    onFocusField?;
    onFieldBlur?;
    dir?;
    name?: string;
    showValidIcon?: boolean;
    isCollatingErrors?: boolean;
    useLabelElement?: boolean;
}

export interface FieldState {
    disabled?: boolean;
    filled?: boolean;
    focused?: boolean;
}
