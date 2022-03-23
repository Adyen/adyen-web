import { Component, cloneElement, toChildArray, h, ComponentChild, VNode, Fragment } from 'preact';
import classNames from 'classnames';
import './Field.scss';
import Spinner from '../../Spinner';
import Icon from '../../Icon';
import { FieldProps, FieldState } from './types';
import { getUniqueId } from '../../../../utils/idGenerator';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';

class Field extends Component<FieldProps, FieldState> {
    private readonly uniqueId: string;

    constructor(props) {
        super(props);

        this.state = { focused: false };

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.uniqueId = getUniqueId(`adyen-checkout-${this.props.name}`);
    }

    onFocus(e) {
        this.setState({ focused: true }, () => {
            if (this.props.onFocus) this.props.onFocus(e);
        });
    }

    onBlur(e) {
        this.setState({ focused: false }, () => {
            if (this.props.onBlur) this.props.onBlur(e);
            // When we also need to fire a specific function when a field blurs
            if (this.props.onFieldBlur) this.props.onFieldBlur(e);
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.focused !== undefined && nextProps.focused !== prevState.focused) {
            return { focused: nextProps.focused };
        }

        if (nextProps.filled !== undefined && nextProps.filled !== prevState.filled) {
            return { filled: nextProps.filled };
        }

        return null;
    }

    renderContent({ name, children, errorMessage, helper, inputWrapperModifiers, isLoading, isValid, label, showValidIcon, isCollatingErrors, dir }) {
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

                {typeof label === 'function' && label()}

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
                                onFocusHandler: this.onFocus,
                                onBlurHandler: this.onBlur,
                                isInvalid: !!errorMessage,
                                ...(name && { uniqueId: this.uniqueId })
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

                {errorMessage && errorMessage.length && (
                    <span
                        className={'adyen-checkout__error-text'}
                        id={`${this.uniqueId}${ARIA_ERROR_SUFFIX}`}
                        aria-hidden={isCollatingErrors ? 'true' : null}
                        aria-live={isCollatingErrors ? null : 'polite'}
                    >
                        {errorMessage}
                    </span>
                )}
            </Fragment>
        );
    }

    render({
        name,
        className = '',
        classNameModifiers = [],
        children,
        errorMessage,
        helper,
        inputWrapperModifiers = [],
        isLoading,
        isValid,
        label,
        useLabelElement = true,
        dir,
        showValidIcon,
        isCollatingErrors
    }) {
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
                    onFocusField={this.props.onFocusField}
                    name={name}
                    disabled={this.props.disabled}
                    filled={this.state.filled}
                    focused={this.state.focused}
                    useLabelElement={useLabelElement}
                    uniqueId={this.uniqueId}
                >
                    {this.renderContent({
                        name,
                        children,
                        errorMessage,
                        helper,
                        inputWrapperModifiers,
                        isLoading,
                        isValid,
                        label,
                        showValidIcon,
                        isCollatingErrors,
                        dir
                    })}
                </LabelOrDiv>
            </div>
        );
    }
}

const LabelOrDiv = ({ onFocusField, focused, filled, disabled, name, uniqueId, useLabelElement, children }) => {
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
};

export default Field;
