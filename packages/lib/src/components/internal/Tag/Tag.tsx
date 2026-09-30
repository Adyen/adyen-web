import { h } from 'preact';
import cx from 'classnames';
import type { TagProps } from './types';
import styles from './Tag.module.scss';
import { TagVariant } from './types';

const variantClass: Record<TagVariant, string> = {
    [TagVariant.SUCCESS]: styles.success,
    [TagVariant.INFO]: styles.info
};

export const Tag = ({ label, variant = TagVariant.INFO }: Readonly<TagProps>) => {
    return <span className={cx(styles.tag, variantClass[variant])}>{label}</span>;
};
