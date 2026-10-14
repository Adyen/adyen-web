import { h } from 'preact';

import cx from 'classnames';

import type { ComponentChildren } from 'preact';

import styles from './ResultPanel.module.scss';

interface ResultPanelClassNames {
    description?: string;
    icon?: string;
    root?: string;
}

interface ResultPanelProps {
    actions?: ComponentChildren;
    classNames?: ResultPanelClassNames;
    description?: string;
    details?: ComponentChildren;
    icon?: string;
    iconAlt?: string;
    title?: string;
}

export function ResultPanel({ actions, classNames, description, details, icon, iconAlt, title }: Readonly<ResultPanelProps>) {
    return (
        <div className={cx(styles.panel, classNames?.root)}>
            {icon && <img className={cx(styles.icon, 'adyen-checkout__result-panel__icon', classNames?.icon)} src={icon} alt={iconAlt ?? ''} />}
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={cx(styles.description, classNames?.description)}>{description}</p>}
            {details && <div className={styles.details}>{details}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    );
}
