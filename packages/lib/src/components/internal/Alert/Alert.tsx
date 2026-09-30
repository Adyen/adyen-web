import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import './Alert.scss';
import Icon from '../Icon';

const ALERT_TYPES = ['error', 'warning', 'info', 'success'];

interface AlertProps {
    children: ComponentChildren;
    classNames?: string[];
    icon?: string;
    /**
     * Where the icon sits relative to the message. 'end' pins it to the trailing edge of the alert.
     */
    iconPosition?: 'start' | 'end';
    type?: (typeof ALERT_TYPES)[number];
}

export default function Alert({ children, classNames = [], type = 'error', icon, iconPosition = 'start' }: Readonly<AlertProps>) {
    const role = type === 'error' || type === 'warning' ? 'alert' : 'status';
    const iconElement = icon ? <Icon className={'adyen-checkout__alert-message__icon'} type={icon} /> : null;
    const hasTrailingIcon = Boolean(icon) && iconPosition === 'end';

    return (
        <div
            role={role}
            className={cx('adyen-checkout__alert-message', `adyen-checkout__alert-message--${type}`, classNames, {
                'adyen-checkout__alert-message--icon-end': hasTrailingIcon
            })}
        >
            {!hasTrailingIcon && iconElement}
            {children}
            {hasTrailingIcon && iconElement}
        </div>
    );
}
