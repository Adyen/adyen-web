import { h } from 'preact';

import classNames from 'classnames';

import type { ComponentChildren } from 'preact';

import styles from './ResultPanel.module.scss';

interface ResultPanelProps {
    actions?: ComponentChildren;
    className?: string;
    description?: string;
    details?: ComponentChildren;
    icon?: string;
    iconAlt?: string;
    title?: string;
}

export function ResultPanel({ actions, className, description, details, icon, iconAlt, title }: Readonly<ResultPanelProps>) {
    return (
        <div className={classNames(styles.panel, className)}>
            {icon && (
                <span className={classNames(styles.iconWrapper, 'adyen-checkout__result-panel__icon-wrapper')}>
                    <img className={classNames(styles.icon, 'adyen-checkout__result-panel__icon')} src={icon} alt={iconAlt ?? ''} />
                </span>
            )}
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}
            {details && <div className={styles.details}>{details}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    );
}
