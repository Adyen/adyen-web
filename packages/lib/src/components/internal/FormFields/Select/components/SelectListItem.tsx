import { h } from 'preact';
import cx from 'classnames';
import { SelectItemProps } from '../types';
import styles from '../Select.module.scss';
import Img from '../../../Img';

const SelectListItem = ({ item, selected, isIconOnLeftSide, ...props }: SelectItemProps) => (
    <li
        aria-disabled={!!item.disabled}
        aria-selected={selected}
        className={cx([
            'adyen-checkout__dropdown__element',
            styles['adyen-checkout__dropdown__element'],
            {
                'adyen-checkout__dropdown__element--active': selected,
                'adyen-checkout__dropdown__element--disabled': !!item.disabled,
                'adyen-checkout__dropdown__element-icon--left': isIconOnLeftSide
            }
        ])}
        // A change in Preact v10.11.1 means that all falsy values are assessed and set on data attributes.
        // In the case of data-disabled we only ever want it set if item.disabled is actually true, since the presence of the data-disabled attr,
        // regardless of its value, will disable the select list item
        data-disabled={item.disabled === true ? true : null}
        data-value={item.id}
        onClick={props.onSelect}
        onKeyDown={props.onKeyDown}
        role="option"
        tabIndex={-1}
    >
        <span>{item.name}</span>
        {item.icon && <Img className="adyen-checkout__dropdown__element__icon" alt={item.name} src={item.icon} />}
    </li>
);

export default SelectListItem;
