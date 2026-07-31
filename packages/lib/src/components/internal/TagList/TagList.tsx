import { h } from 'preact';
import cx from 'classnames';
import { Tag } from '../Tag';
import type { TagListProps } from './types';
import styles from './TagList.module.scss';

export const TagList = ({ tags, className }: Readonly<TagListProps>) => {
    if (!tags?.length) return null;
    return (
        <div className={cx(styles.tagList, className)}>
            {tags.map((tag, index) => (
                <Tag key={`${index}-${tag.label}`} label={tag.label} variant={tag.variant} />
            ))}
        </div>
    );
};
