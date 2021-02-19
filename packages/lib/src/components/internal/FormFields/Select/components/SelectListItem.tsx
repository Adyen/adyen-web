import { h } from 'preact';
import cx from 'classnames';
import { SelectItemProps } from '../types';
import styles from '../Select.module.scss';

const SelectListItem = ({ item, selected, ...props }: SelectItemProps) => (
    <li
        aria-disabled={!!item.disabled}
        aria-selected={selected}
        className={cx([
            'adyen-checkout__dropdown__element',
            styles['adyen-checkout__dropdown__element'],
            {
                'adyen-checkout__dropdown__element--active': selected,
                'adyen-checkout__dropdown__element--disabled': !!item.disabled
            }
        ])}
        data-disabled={!!item.disabled}
        data-value={item.id}
        onClick={props.onSelect}
        onKeyDown={props.onKeyDown}
        role="option"
        tabIndex={-1}
    >
        <span>{item.name}</span>
        {item.icon && <img className="adyen-checkout__dropdown__element__icon" alt={item.name} src={item.icon} />}
    </li>
);

export default SelectListItem;
