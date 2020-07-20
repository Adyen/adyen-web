import { Component, h } from 'preact';
import classNames from 'classnames';
import Spinner from '../Spinner';
import useCoreContext from '../../../core/Context/useCoreContext';
import './Button.scss';
import { ButtonProps, ButtonState } from './types';

class Button extends Component<ButtonProps, ButtonState> {
    public static defaultProps = {
        status: 'default',
        disabled: false,
        label: '',
        secondary: false,
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

    render({ classNameModifiers = [], disabled, href, icon, secondary, inline, label, status }, { completed }) {
        const { i18n } = useCoreContext();

        const buttonIcon = icon ? <img className="adyen-checkout__button__icon" src={icon} alt="" aria-hidden="true" /> : '';

        const modifiers = [
            ...classNameModifiers,
            ...(inline ? ['inline'] : []),
            ...(completed ? ['completed'] : []),
            ...(secondary ? ['secondary'] : []),
            ...(status === 'loading' || status === 'redirect' ? ['loading'] : [])
        ];

        const buttonClasses = classNames(['adyen-checkout__button', ...modifiers.map(m => `adyen-checkout__button--${m}`)]);

        const buttonStates = {
            loading: <Spinner size="medium" />,
            redirect: (
                <span className="adyen-checkout__button__content">
                    <Spinner size="small" inline />
                    {i18n.get('payButton.redirecting')}
                </span>
            ),
            default: (
                <span className="adyen-checkout__button__content">
                    {buttonIcon}
                    <span className="adyen-checkout__button__text">{label}</span>
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
            <button className={buttonClasses} type="button" disabled={disabled} onClick={this.onClick}>
                {buttonText}
            </button>
        );
    }
}

export default Button;
