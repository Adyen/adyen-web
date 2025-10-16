import { Component, h } from 'preact';
import classNames from 'classnames';
import Spinner from '../Spinner';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import './Button.scss';
import { ButtonProps, ButtonState } from './types';

class Button extends Component<ButtonProps, ButtonState> {
    public static defaultProps = {
        status: 'default',
        variant: 'primary',
        disabled: false,
        label: '',
        inline: false,
        target: '_self'
    };

    public onClick = (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!this.props.disabled) {
            this.props.onClick?.(e, { complete: this.complete });
        }
    };

    public complete = (delay = 1_000) => {
        this.setState({ completed: true });
        setTimeout(() => {
            this.setState({ completed: false });
        }, delay);
    };

    render() {
        const {
            classNameModifiers = [],
            disabled,
            href,
            icon,
            onClickCompletedIcon,
            inline,
            label,
            ariaLabel,
            ariaDescribedBy,
            status,
            variant,
            buttonRef,
            onClickCompletedLabel,
            onMouseEnter,
            onMouseLeave,
            onFocus,
            onBlur,
            onKeyDown,
            onKeyPress
        }: ButtonProps = this.props;
        const { completed } = this.state;
        const { i18n } = useCoreContext();

        const buttonIcon =
            onClickCompletedIcon || icon ? (
                <img
                    className="adyen-checkout__button__icon"
                    src={this.state.completed ? (onClickCompletedIcon ?? icon) : icon}
                    alt=""
                    aria-hidden="true"
                />
            ) : (
                ''
            );

        const modifiers = [
            ...classNameModifiers,
            ...(variant !== 'primary' ? [variant] : []),
            ...(inline ? ['inline'] : []),
            ...(completed ? ['completed'] : []),
            ...(status === 'loading' || status === 'redirect' ? ['loading'] : [])
        ];

        const buttonClasses = classNames(['adyen-checkout__button', ...modifiers.map(m => `adyen-checkout__button--${m}`)]);

        const buttonStates = {
            loading: (
                <span className="adyen-checkout__button__content">
                    <Spinner size="medium" inline />
                    <span className={'adyen-checkout__button__text--sr-only'}>{i18n.get('loading')}</span>
                </span>
            ),
            redirect: (
                <span className="adyen-checkout__button__content">
                    <Spinner size="medium" inline />
                    {i18n.get('payButton.redirecting')}
                </span>
            ),
            default: (
                <span className="adyen-checkout__button__content">
                    {buttonIcon}
                    <span className="adyen-checkout__button__text">{this.state.completed ? (onClickCompletedLabel ?? label) : label}</span>
                </span>
            )
        };

        const buttonText = buttonStates[status] || buttonStates.default;

        if (href) {
            return (
                <a className={buttonClasses} href={href} disabled={disabled} target={this.props.target} rel={this.props.rel}>
                    {buttonText}
                </a>
            );
        }

        return (
            <button
                ref={buttonRef}
                className={buttonClasses}
                type="button"
                disabled={disabled}
                onClick={this.onClick}
                aria-label={ariaLabel}
                aria-describedby={ariaDescribedBy}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyPress={onKeyPress}
            >
                {buttonText}
                {status !== 'loading' && status !== 'redirect' && this.props.children}
            </button>
        );
    }
}

export default Button;
