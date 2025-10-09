import classNames from 'classnames';
import { cloneElement, ComponentChild, Fragment, FunctionalComponent, h, toChildArray, VNode } from 'preact';
import Spinner from '../../Spinner';
import Icon from '../../Icon';
import { ARIA_CONTEXT_SUFFIX, ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { getUniqueId } from '../../../../utils/idGenerator';
import { FieldProps } from './types';
import './Field.scss';
import { PREFIX } from '../../Icon/constants';
import uuid from '../../../../utils/uuid';

const Field: FunctionalComponent<FieldProps> = props => {
    const {
        children,
        className,
        classNameModifiers,
        dir,
        disabled,
        readOnly,
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
        // onFocusField is a securedField related function that allows a label click to set focus on a securedField (equates to CardInput setFocusOn)
        // TODO should rename it to make its purpose clear => setFocusOnSecuredField
        onFocusField,
        showValidIcon,
        useLabelElement,
        showErrorElement,
        showContextualElement,
        staticValue,
        contextualText,
        // Redeclare prop names to avoid internal clashes
        filled: propsFilled,
        focused: propsFocused,
        i18n,
        contextVisibleToScreenReader,
        renderAlternativeToLabel,
        onInputContainerClick
    } = props;

    // Controls whether any error element has an aria-hidden="true" attr (which means it is the error for a securedField)
    // or whether it has an id attr that can be pointed to by an aria-describedby attr on an input element
    const contextVisibleToSR = contextVisibleToScreenReader ?? true;
    const showError = showErrorElement && typeof errorMessage === 'string' && errorMessage.length > 0;
    const showContext = showContextualElement && !showError && contextualText?.length > 0;

    const uniqueId = useRef(getUniqueId(`adyen-checkout-${name}`));
    const staticValueId = useMemo(() => (staticValue ? `input-static-value-${uuid()}` : null), [staticValue]);

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
            // When we also need to fire a specific function when a field blurs // TODO - what is the use case?
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
    }, [label, errorMessage, labelEndAdornment, helper]);

    const renderInputRelatedElements = useCallback(() => {
        const errorElem = (
            <span
                className={classNames({ 'adyen-checkout-contextual-text--error': true, 'adyen-checkout-contextual-text--hidden': !showError })}
                {...(contextVisibleToSR && { id: `${uniqueId.current}${ARIA_ERROR_SUFFIX}` })}
                aria-hidden={contextVisibleToSR ? null : 'true'}
            >
                {errorMessage}
            </span>
        );
        const contextualElem = (
            <span
                className={classNames({ 'adyen-checkout-contextual-text': true, 'adyen-checkout-contextual-text--hidden': !showContext })}
                {...(contextVisibleToSR && { id: `${uniqueId.current}${ARIA_CONTEXT_SUFFIX}` })}
                aria-hidden={contextVisibleToSR ? null : 'true'}
            >
                {contextualText}
            </span>
        );

        return (
            <Fragment>
                {/* The <div> element has a child <input> element that allows keyboard interaction */}
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
                <div
                    className={classNames([
                        'adyen-checkout__input-wrapper',
                        ...inputWrapperModifiers.map(m => `adyen-checkout__input-wrapper--${m}`)
                    ])}
                    dir={dir}
                    onClick={onInputContainerClick}
                >
                    {staticValue && (
                        <span id={staticValueId} className="adyen-checkout__field-static-value">
                            {staticValue}
                        </span>
                    )}

                    {toChildArray(children).map((child: ComponentChild): ComponentChild => {
                        const propsFromFieldComponent = {
                            isValid,
                            onFocusHandler,
                            onBlurHandler,
                            isInvalid: !!errorMessage,
                            'aria-owns': staticValueId,
                            ...(name && { uniqueId: uniqueId.current }),
                            showErrorElement: showErrorElement
                        };

                        return cloneElement(child as VNode, propsFromFieldComponent);
                    })}

                    {isLoading && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--loading">
                            <Spinner size="small" />
                        </span>
                    )}

                    {isValid && showValidIcon !== false && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--valid">
                            <Icon type={`${PREFIX}checkmark`} alt={i18n?.get('field.valid')} />
                        </span>
                    )}

                    {errorMessage && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--invalid">
                            <Icon type={`${PREFIX}field_error`} alt={i18n?.get('error.title')} />
                        </span>
                    )}
                </div>
                {errorElem}
                {contextualElem}
            </Fragment>
        );
    }, [children, errorMessage, contextualText, isLoading, isValid, onFocusHandler, onBlurHandler]);

    /**
     * Use cases:
     * - Not all form controls want/need a label e.g. many checkboxes describe what they are in their own markup and don't need the wrapping Field to also generate a labelling element
     * - securedFields *can't* have a label (screen-reader's can make the association, over different browser contexts, between the label and the input)
     */
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
                // if we are NOT dealing with the label for a securedField... we can give it a `for` attribute
                <label {...defaultWrapperProps} {...(!isSecuredField && name && { htmlFor: uniqueId })}>
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
            data-testid="form-field"
            className={classNames(
                'adyen-checkout__field',
                className,
                classNameModifiers.map(m => `adyen-checkout__field--${m}`),
                {
                    'adyen-checkout__field--error': errorMessage,
                    'adyen-checkout__field--valid': isValid,
                    'adyen-checkout__field--inactive': readOnly || disabled
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
