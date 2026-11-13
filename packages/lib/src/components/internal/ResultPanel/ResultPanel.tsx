import { h } from 'preact';

import type { ComponentChildren } from 'preact';

import styles from './ResultPanel.module.scss';

interface ResultPanelClassNames {
    actions?: string;
    description?: string;
    details?: string;
    icon?: string;
    root?: string;
    title?: string;
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
        <div className={classNames?.root ?? styles.panel}>
            {icon && <img className={classNames?.icon ?? styles.icon} src={icon} alt={iconAlt ?? ''} />}
            {title && <h2 className={classNames?.title ?? styles.title}>{title}</h2>}
            {description && <p className={classNames?.description ?? styles.description}>{description}</p>}
            {details && <div className={classNames?.details ?? styles.details}>{details}</div>}
            {actions && <div className={classNames?.actions ?? styles.actions}>{actions}</div>}
        </div>
    );
}
