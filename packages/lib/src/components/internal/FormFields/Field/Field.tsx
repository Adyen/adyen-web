import classNames from 'classnames';
import { cloneElement, ComponentChild, Fragment, FunctionalComponent, h, toChildArray, VNode } from 'preact';
import Spinner from '../../Spinner';
import Icon from '../../Icon';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
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
        isCollatingErrors,
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
        // Redeclare prop names to avoid internal clashes
        filled: propsFilled,
        focused: propsFocused
    } = props;

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

    const renderContent = useCallback(() => {
        return (
            <Fragment>
                {typeof label === 'string' && (
                    <span
                        className={classNames({
                            'adyen-checkout__label__text': true,
                            'adyen-checkout__label__text--error': errorMessage
                        })}
                    >
                        {label}
                    </span>
                )}

                {/*@ts-ignore - function is callable*/}
                {typeof label === 'function' && label()}

                {labelEndAdornment && <span className="adyen-checkout__label-adornment--end">{labelEndAdornment}</span>}

                {helper && <span className={'adyen-checkout__helper-text'}>{helper}</span>}
                <div
                    className={classNames([
                        'adyen-checkout__input-wrapper',
                        ...inputWrapperModifiers.map(m => `adyen-checkout__input-wrapper--${m}`)
                    ])}
                    dir={dir}
                >
                    {toChildArray(children).map(
                        (child: ComponentChild): ComponentChild => {
                            const childProps = {
                                isValid,
                                onFocusHandler,
                                onBlurHandler,
                                isInvalid: !!errorMessage,
                                ...(name && { uniqueId: uniqueId.current })
                            };
                            return cloneElement(child as VNode, childProps);
                        }
                    )}

                    {isLoading && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--loading">
                            <Spinner size="small" />
                        </span>
                    )}

                    {isValid && showValidIcon !== false && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--valid">
                            <Icon type="checkmark" />
                        </span>
                    )}

                    {errorMessage && (
                        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--invalid">
                            <Icon type="field_error" />
                        </span>
                    )}
                </div>
                {errorMessage && typeof errorMessage === 'string' && errorMessage.length && (
                    <span
                        className={'adyen-checkout__error-text'}
                        id={`${uniqueId.current}${ARIA_ERROR_SUFFIX}`}
                        aria-hidden={isCollatingErrors ? 'true' : null}
                        aria-live={isCollatingErrors ? null : 'polite'}
                    >
                        {errorMessage}
                    </span>
                )}
            </Fragment>
        );
    }, [children, errorMessage, isLoading, isValid, label, onFocusHandler, onBlurHandler]);

    const LabelOrDiv = useCallback(({ onFocusField, focused, filled, disabled, name, uniqueId, useLabelElement, children }) => {
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
            <label {...defaultWrapperProps} htmlFor={name && uniqueId}>
                {children}
            </label>
        ) : (
            <div {...defaultWrapperProps} role={'form'}>
                {children}
            </div>
        );
    }, []);

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
            <LabelOrDiv
                onFocusField={onFocusField}
                name={name}
                disabled={disabled}
                filled={filled}
                focused={focused}
                useLabelElement={useLabelElement}
                uniqueId={uniqueId.current}
            >
                {renderContent()}
            </LabelOrDiv>
        </div>
    );
};

Field.defaultProps = {
    className: '',
    classNameModifiers: [],
    inputWrapperModifiers: [],
    useLabelElement: true
};

export default Field;
