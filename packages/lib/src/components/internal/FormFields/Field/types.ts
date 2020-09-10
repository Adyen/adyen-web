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
    dualBrandingElements?: any;
    onBlur?;
    onFocus?;
    onFocusField?;
    onFieldBlur?;
}

export interface FieldState {
    disabled?: boolean;
    filled?: boolean;
    focused?: boolean;
}
