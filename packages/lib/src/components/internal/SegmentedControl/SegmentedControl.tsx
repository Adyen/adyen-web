import { h } from 'preact';
import classnames from 'classnames';
import './ButtonGroup.scss';

const Button = ({ selected = false, children, ...props }) => {
    return (
        <button
            className={classnames('adyen-checkout__button-group-button', { 'adyen-checkout__button-group-button--selected': selected })}
            type="button"
            {...props}
        >
            {children}
        </button>
    );
};

const ButtonGroup = ({ children }) => {
    if (!children) return null;

    return <div className="adyen-checkout__button-group-new">{children}</div>;
};

ButtonGroup.Button = Button;

export default ButtonGroup;
