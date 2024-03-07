import { Component, h } from 'preact';
import classNames from 'classnames';
import Spinner from '../Spinner';
import useCoreContext from '../../../core/Context/useCoreContext';
import './Button.scss';
import { ButtonProps, ButtonState } from './types';
import { UIElementStatus } from '../UIElement/types';

type ButtonStatus = Exclude<UIElementStatus, 'ready' | 'error' | 'success'>;

class Button extends Component<ButtonProps, ButtonState> {
    public static defaultProps = {
        status: 'default',
        variant: 'primary',
        disabled: false,
        label: '',
        inline: false,
        target: '_self',
        onClick: () => {}
    };

    public onClick = e => {
        e.preventDefault();

        if (!this.props.disabled) {
            this.props.onClick(e, { complete: this.complete });
        }
    };

    public complete = (delay = 1000) => {
        this.setState({ completed: true });
        setTimeout(() => {
            this.setState({ completed: false });
        }, delay);
    };

    render({ classNameModifiers = [], disabled, href, icon, inline, label, status, variant }, { completed }) {
        const { i18n } = useCoreContext();

        const buttonIcon = icon ? <img className="adyen-checkout__button__icon" src={icon} alt="" aria-hidden="true" /> : '';

        const modifiers = [
            ...classNameModifiers,
            ...(variant !== 'primary' ? [variant] : []),
            ...(inline ? ['inline'] : []),
            ...(completed ? ['completed'] : []),
            ...(status === 'loading' || status === 'redirect' ? ['loading'] : [])
        ];

        const buttonClasses = classNames(['adyen-checkout__button', ...modifiers.map(m => `adyen-checkout__button--${m}`)]);

        const defaultButtonContent = (
            <span className="adyen-checkout__button__content">
                {buttonIcon}
                <span className="adyen-checkout__button__text">{label}</span>
            </span>
        );

        const buttonStates: Record<ButtonStatus, h.JSX.Element> = {
            loading: <Spinner size="medium" />,
            redirect: (
                <span className="adyen-checkout__button__content">
                    <Spinner size="medium" inline />
                    {i18n.get('payButton.redirecting')}
                </span>
            )
        };

        const buttonText = buttonStates[status] || defaultButtonContent;

        if (href) {
            return (
                <a className={buttonClasses} href={href} disabled={disabled} target={this.props.target} rel={this.props.rel}>
                    {buttonText}
                </a>
            );
        }

        return (
            <button className={buttonClasses} type="button" disabled={disabled} onClick={this.onClick}>
                {buttonText}
                {status !== 'loading' && status !== 'redirect' && this.props.children}
            </button>
        );
    }
}

export default Button;
