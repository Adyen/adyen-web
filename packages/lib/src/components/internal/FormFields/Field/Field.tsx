import classNames from 'classnames';
import { cloneElement, ComponentChild, Fragment, FunctionalComponent, h, toChildArray, VNode } from 'preact';
import Spinner from '../../Spinner';
import Icon from '../../Icon';
import { ARIA_CONTEXT_SUFFIX, ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
import { useCallback, useRef, useState } from 'preact/hooks';
import { getUniqueId } from '../../../../utils/idGenerator';
import { FieldProps } from './types';
import './Field.scss';

const Field: FunctionalComponent<FieldProps> = props => {
    //
    const {
        children,
        className,
        classNameModifiers,
        dir,
        disabled,
        errorMessage,
        helper,
        inputWrapperModifiers,
        isLoading,
        isValid,
        label,
        labelEndAdornment,
        name,
        onBlur,
        onFieldBlur,
        onFocus,
        onFocusField,
        showValidIcon,
        useLabelElement,
        showErrorElement,
        showContextualElement,
        contextualText,
        // Redeclare prop names to avoid internal clashes
        filled: propsFilled,
        focused: propsFocused,
        i18n,
        contextVisibleToScreenReader,
        renderAlternativeToLabel
    } = props;

    // Controls whether any error element has an aria-hidden="true" attr (which means it is the error for a securedField)
    // or whether it has an id attr that can be pointed to by an aria-describedby attr on an input element
    const contextVisibleToSR = contextVisibleToScreenReader ?? true;

    const uniqueId = useRef(getUniqueId(`adyen-checkout-${name}`));

    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(false);

    // The means by which focussed/filled is set for securedFields
    if (propsFocused != null) setFocused(!!propsFocused);
    if (propsFilled != null) setFilled(!!propsFilled);

    // The means by which focussed/filled is set for other fields - this function is passed down to them and triggered
    const onFocusHandler = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(event);
        },
        [onFocus]
    );

    const onBlurHandler = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            setFocused(false);
            onBlur?.(event);
            // When we also need to fire a specific function when a field blurs
            onFieldBlur?.(event);
        },
        [onBlur, onFieldBlur]
    );

    const renderLabelOrAlternativeContents = useCallback(() => {
        return (
            <Fragment>
                {typeof label === 'string' && (
                    <span
                        className={classNames({
                            'adyen-checkout__label__text': true,
                            'adyen-checkout__label__text--error': errorMessage
                        })}
                        data-id={name}
                    >
                        {label}
                    </span>
                )}

                {/*TODO - in what scenario is label a function? */}
                {/*@ts-ignore - function is callable*/}
                {typeof label === 'function' && label()}

                {labelEndAdornment && <span className="adyen-checkout__label-adornment--end">{labelEndAdornment}</span>}

                {helper && <span className={'adyen-checkout__helper-text'}>{helper}</span>}
            </Fragment>
        );
    }, [label, errorMessage]);

    const renderInputRelatedElements = useCallback(() => {
        const showError = showErrorElement && typeof errorMessage === 'string' && errorMessage.length > 0;
        const errorElem = showError && (
            <span
                className={'adyen-checkout-contextual-text--error'}
                {...(contextVisibleToSR && { id: `${uniqueId.current}${ARIA_ERROR_SUFFIX}` })}
                aria-hidden={contextVisibleToSR ? null : 'true'}
            >
                {errorMessage}
            </span>
        );

        const showContext = showContextualElement && !showError && contextualText?.length > 0;
        const contextualElem = showContext && (
            <span
                className={'adyen-checkout-contextual-text'}
                {...(contextVisibleToSR && { id: `${uniqueId.current}${ARIA_CONTEXT_SUFFIX}` })}
                aria-hidden={contextVisibleToSR ? null : 'true'}
            >
                {contextualText}
            </span>
        );

        return (
            <Fragment>
                <div
                    className={classNames([
                        'adyen-checkout__input-wrapper',
                        ...inputWrapperModifiers.map(m => `adyen-checkout__input-wrapper--${m}`)
                    ])}
                    dir={dir}
                >
                    {toChildArray(children).map((child: ComponentChild): ComponentChild => {
                        const childProps = {
                            isValid,
                            onFocusHandler,
                            onBlurHandler,
                            isInvalid: !!errorMessage,
                            ...(name && { uniqueId: uniqueId.current }),
                            showErrorElement: showErrorElement
                        };
                        return cloneElement(child as VNode, childProps);
                    })}

                    {isLoading && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--loading">
                            <Spinner size="small" />
                        </span>
                    )}

                    {isValid && showValidIcon !== false && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--valid">
                            <Icon type="checkmark" alt={i18n?.get('field.valid')} />
                        </span>
                    )}

                    {errorMessage && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--invalid">
                            <Icon type="field_error" alt={i18n?.get('error.title')} />
                        </span>
                    )}
                </div>
                {errorElem}
                {contextualElem}
            </Fragment>
        );
    }, [children, errorMessage, contextualText, isLoading, isValid, onFocusHandler, onBlurHandler]);

    const LabelOrAlternative = useCallback(
        ({ onFocusField, focused, filled, disabled, name, uniqueId, useLabelElement, isSecuredField, children, renderAlternativeToLabel }) => {
            const defaultWrapperProps = {
                onClick: onFocusField,
                className: classNames({
                    'adyen-checkout__label': true,
                    'adyen-checkout__label--focused': focused,
                    'adyen-checkout__label--filled': filled,
                    'adyen-checkout__label--disabled': disabled
                })
            };

            return useLabelElement ? (
                // if contextVisibleToSR is true then we are NOT dealing with the label for a securedField... so give it a `for` attribute
                <label {...defaultWrapperProps} {...(!isSecuredField && { htmlFor: name && uniqueId })}>
                    {children}
                </label>
            ) : (
                renderAlternativeToLabel(defaultWrapperProps, children, uniqueId) // defaults to null

                // Example usage:
                // const alternativeLabelContent = (defaultWrapperProps, children, uniqueId) => {
                //     return (
                //         <div {...defaultWrapperProps} role={'label'} htmlFor={uniqueId}>
                //             {children}
                //         </div>
                //     );
                // };
                // <Field name={'myField'} useLabelElement={false} renderAlternativeToLabel={alternativeLabelContent}>
            );
        },
        []
    );

    /**
     * RENDER
     */
    return (
        <div
            className={classNames(
                'adyen-checkout__field',
                className,
                classNameModifiers.map(m => `adyen-checkout__field--${m}`),
                {
                    'adyen-checkout__field--error': errorMessage,
                    'adyen-checkout__field--valid': isValid
                }
            )}
        >
            <LabelOrAlternative
                onFocusField={onFocusField}
                name={name}
                disabled={disabled}
                filled={filled}
                focused={focused}
                useLabelElement={useLabelElement}
                uniqueId={uniqueId.current}
                isSecuredField={!contextVisibleToSR}
                renderAlternativeToLabel={renderAlternativeToLabel}
            >
                {renderLabelOrAlternativeContents()}
            </LabelOrAlternative>
            {renderInputRelatedElements()}
        </div>
    );
};

Field.defaultProps = {
    className: '',
    classNameModifiers: [],
    inputWrapperModifiers: [],
    useLabelElement: true,
    showErrorElement: true,
    showContextualElement: true,
    renderAlternativeToLabel: () => null
};

export default Field;
