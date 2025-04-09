import { h, Component, ComponentChildren } from 'preact';
import Language from '../../../../language';

export interface FieldProps {
    name: string;
    className?: string;
    classNameModifiers?: string[];
    children?: ComponentChildren;
    disabled?: boolean;
    readOnly?: boolean;
    showErrorElement?: boolean;
    errorMessage?: string | boolean;
    showContextualElement?: boolean;
    contextualText?: string;
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
    staticValue?: string | ComponentChildren;
    useLabelElement?: boolean;
    i18n?: Language;
    contextVisibleToScreenReader?: boolean;
    renderAlternativeToLabel?: (defaultWrapperProps, children, uniqueId) => any;
    /**
     * Callback that reports when there is a click on the input field parent container
     */
    onInputContainerClick?(): void;
}

export interface FieldState {
    disabled?: boolean;
    filled?: boolean;
    focused?: boolean;
}
