import { h } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import classNames from 'classnames';
import { ARIA_ERROR_SUFFIX } from '../../../core/Errors/constants';

export default function InputBase(props) {
    const { autoCorrect, classNameModifiers, isInvalid, isValid, readonly = null, spellCheck, type, uniqueId, isCollatingErrors } = props;

    const [handleChangeHasFired, setHandleChangeHasFired] = useState(false);

    const handleInput = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement>) => {
        props.onInput(event);
    }, []);

    const handleChange = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement>) => {
        setHandleChangeHasFired(true);
        props?.onChange?.(event);
    }, []);

    const handleBlur = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement>) => {
        if (!handleChangeHasFired) {
            props?.onChange?.(event);
        }
        setHandleChangeHasFired(false);

        props?.onBlur?.(event);
    }, []);

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
    const { classNameModifiers: cnm, uniqueId: uid, isInvalid: iiv, isValid: iv, isCollatingErrors: ce, ...newProps } = props;

    return (
        <input
            id={uniqueId}
            {...newProps}
            type={type}
            className={inputClassNames}
            onInput={handleInput}
            readOnly={readonly}
            spellCheck={spellCheck}
            autoCorrect={autoCorrect}
            aria-describedby={isCollatingErrors ? null : `${uniqueId}${ARIA_ERROR_SUFFIX}`}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={isInvalid}
        />
    );
}

InputBase.defaultProps = {
    type: 'text',
    classNameModifiers: []
};
