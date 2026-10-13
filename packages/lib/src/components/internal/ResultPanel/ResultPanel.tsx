import { h } from 'preact';

import cx from 'classnames';

import type { ComponentChildren } from 'preact';

import styles from './ResultPanel.module.scss';

interface ResultPanelClassNames {
    actions?: string;
    description?: string;
    details?: string;
    icon?: string;
    iconWrapper?: string;
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
    wrapIcon?: boolean;
}

export function ResultPanel({ actions, classNames, description, details, icon, iconAlt, title, wrapIcon = true }: Readonly<ResultPanelProps>) {
    const iconElement = icon && (
        <img className={cx(styles.icon, 'adyen-checkout__result-panel__icon', classNames?.icon)} src={icon} alt={iconAlt ?? ''} />
    );

    return (
        <div className={cx(styles.panel, classNames?.root)}>
            {iconElement &&
                (wrapIcon ? (
                    <span className={cx(styles.iconWrapper, 'adyen-checkout__result-panel__icon-wrapper', classNames?.iconWrapper)}>
                        {iconElement}
                    </span>
                ) : (
                    iconElement
                ))}
            {title && <h2 className={cx(styles.title, classNames?.title)}>{title}</h2>}
            {description && <p className={cx(styles.description, classNames?.description)}>{description}</p>}
            {details && <div className={cx(styles.details, classNames?.details)}>{details}</div>}
            {actions && <div className={cx(styles.actions, classNames?.actions)}>{actions}</div>}
        </div>
    );
}
