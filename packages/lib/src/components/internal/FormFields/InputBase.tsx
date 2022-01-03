import { h } from 'preact';
import { useState, useCallback, useRef } from 'preact/hooks';
import classNames from 'classnames';
import { convertFullToHalf } from './utils';
import { ARIA_ERROR_SUFFIX } from '../../../core/Errors/constants';

export default function InputBase(props) {
    const { autoCorrect, classNameModifiers, isInvalid, isValid, readonly = null, spellCheck, type, uniqueId, isCollatingErrors } = props;

    const [handleChangeHasFired, setHandleChangeHasFired] = useState(false);
    const isOnComposition = useRef<boolean>(false);

    const handleInput = e => {
        if (isOnComposition.current) return;

        e.target.value = convertFullToHalf(e.target.value);
        props.onInput(e);
    };

    const handleOnCompositionStart = useCallback(() => {
        isOnComposition.current = true;
    }, []);

    const handleOnCompositionUpdate = useCallback((event: h.JSX.TargetedCompositionEvent<HTMLInputElement>) => {
        props.onInput(event);
    }, []);

    const handleOnCompositionEnd = useCallback((event: h.JSX.TargetedCompositionEvent<HTMLInputElement>) => {
        isOnComposition.current = false;
        handleInput(event);
    }, []);

    const handleChange = e => {
        setHandleChangeHasFired(true);
        props?.onChange?.(e);
    };

    const handleBlur = e => {
        if (!handleChangeHasFired) {
            props?.onChange?.(e);
        }
        setHandleChangeHasFired(false);

        props?.onBlur?.(e);
    };

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
            onCompositionStart={handleOnCompositionStart}
            onCompositionUpdate={handleOnCompositionUpdate}
            onCompositionEnd={handleOnCompositionEnd}
        />
    );
}

InputBase.defaultProps = {
    type: 'text',
    classNameModifiers: []
};
