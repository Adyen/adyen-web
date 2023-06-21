import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import classNames from 'classnames';
import { ARIA_ERROR_SUFFIX } from '../../../core/Errors/constants';

export interface InputBaseProps {
    /** Callback used to return the input element reference to parent component (Ex: Used to trigger focus programmatically) */
    autoCorrect?: string;
    autocorrect?: string; //TODO: needs fixing, use on or the other

    autocomplete?: string;
    autoComplete?: boolean; //TODO: simple enough

    classNameModifiers?: Array<string>;
    isInvalid?: boolean;
    isValid?: boolean;
    readonly?: boolean;
    spellCheck?: boolean;
    type?: string;
    uniqueId?: string;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
    name?: string;
    spellcheck?: boolean;
    inputMode?: string;

    maxLength?: number;
    maxlength?: number; //TODO

    minLength?: number;

    // TODO aria values should be camelCase ie: ariaLabel
    'aria-label'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: string;

    trimOnBlur?: boolean;

    // TODO: this values should be inferred somehow
    // Select
    filterable?: boolean;
    items?: Array<any>;
    selected?: number | string; //TODO we should fix this and always type strings
    disableTextFilter?: boolean;

    onCreateRef?(reference: HTMLInputElement): void;

    onInput?: (event: h.JSX.TargetedEvent<HTMLInputElement>) => void;
    onClick?: (event: h.JSX.TargetedEvent<HTMLInputElement>) => void;
    onChange?: (event: h.JSX.TargetedEvent<HTMLInputElement>) => void;
    onKeyPress?: (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => void;
    onKeyUp?: (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (event: h.JSX.TargetedEvent<HTMLInputElement>) => void;
    onBlurHandler?: (event: h.JSX.TargetedEvent<HTMLInputElement>) => void;
    onFocusHandler?: (event: h.JSX.TargetedEvent<HTMLInputElement>) => void;
}

export default function InputBase({ onCreateRef, ...props }: InputBaseProps) {
    const { autoCorrect, classNameModifiers, isInvalid, isValid, readonly = null, spellCheck, type, uniqueId, disabled } = props;
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onCreateRef?.(inputRef.current);
    }, [inputRef.current, onCreateRef]);

    /**
     * To avoid confusion with misplaced/misdirected onChange handlers - InputBase only accepts onInput, onBlur & onFocus handlers.
     * The first 2 being the means by which we expect useForm--handleChangeFor validation functionality to be applied.
     */
    if (Object.prototype.hasOwnProperty.call(props, 'onChange')) {
        console.error('Error: Form fields that rely on InputBase may not have an onChange property');
    }

    const handleInput = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            props.onInput(event);
        },
        [props.onInput]
    );

    const handleKeyPress = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (props?.onKeyPress) props.onKeyPress(event);
        },
        [props?.onKeyPress]
    );

    const handleKeyUp = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (props?.onKeyUp) props.onKeyUp(event);
        },
        [props?.onKeyUp]
    );

    const handleBlur = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            props?.onBlurHandler?.(event); // From Field component

            if (props.trimOnBlur) {
                (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.trim(); // needed to trim trailing spaces in field (leading spaces can be done via formatting)
            }

            props?.onBlur?.(event);
        },
        [props.onBlur, props.onBlurHandler]
    );

    const handleFocus = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            props?.onFocusHandler?.(event); // From Field component
        },
        [props.onFocusHandler]
    );

    const inputClassNames = classNames(
        'adyen-checkout__input',
        [`adyen-checkout__input--${type}`],
        props.className,
        {
            'adyen-checkout__input--invalid': isInvalid,
            'adyen-checkout__input--valid': isValid
        },
        classNameModifiers.map(m => `adyen-checkout__input--${m}`)
    );

    // Don't spread classNameModifiers etc to input element (it ends up as an attribute on the element itself)
    const { classNameModifiers: cnm, uniqueId: uid, isInvalid: iiv, isValid: iv, ...newProps } = props;

    return (
        <input
            id={uniqueId}
            {...newProps}
            aria-required={newProps.required}
            type={type}
            className={inputClassNames}
            readOnly={readonly}
            spellCheck={spellCheck}
            autoCorrect={autoCorrect}
            aria-describedby={`${uniqueId}${ARIA_ERROR_SUFFIX}`}
            aria-invalid={isInvalid}
            onInput={handleInput}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyUp={handleKeyUp}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            ref={inputRef}
        />
    );
}

InputBase.defaultProps = {
    type: 'text',
    classNameModifiers: []
};
