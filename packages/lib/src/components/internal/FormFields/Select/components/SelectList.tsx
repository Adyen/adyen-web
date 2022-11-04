import { h } from 'preact';
import cx from 'classnames';
import SelectListItem from './SelectListItem';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectListProps } from '../types';
import styles from '../Select.module.scss';

function SelectList({ active, items, showList, textFilter, ...props }: SelectListProps) {
    const { i18n } = useCoreContext();
    const filteredItems = items.filter(item => !textFilter || item.name.toLowerCase().includes(textFilter));

    return (
        <ul
            className={cx({
                test: true,
                'adyen-checkout__dropdown__list': true,
                [styles['adyen-checkout__dropdown__list']]: true,
                'adyen-checkout__dropdown__list--active': showList,
                [styles['adyen-checkout__dropdown__list--active']]: showList
            })}
            id={props.selectListId}
            ref={props.selectListRef}
            role="listbox"
        >
            {filteredItems.length ? (
                filteredItems.map(item => (
                    <SelectListItem
                        item={item}
                        key={item.id}
                        onKeyDown={props.onKeyDown}
                        onSelect={props.onSelect}
                        selected={item.id === active.id}
                    />
                ))
            ) : (
                <div className="adyen-checkout__dropdown__element adyen-checkout__dropdown__element--no-options">
                    {i18n.get('select.noOptionsFound')}
                </div>
            )}
        </ul>
    );
}

export default SelectList;
