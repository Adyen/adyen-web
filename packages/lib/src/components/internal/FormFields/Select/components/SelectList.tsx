import { h } from 'preact';
import cx from 'classnames';
import SelectListItem from './SelectListItem';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectListProps } from '../types';

function SelectList({ selected, active, filteredItems, showList, ...props }: SelectListProps) {
    const { i18n } = useCoreContext();

    return (
        <ul
            className={cx({
                'adyen-checkout__dropdown__list': true,
                'adyen-checkout__dropdown__list--active': showList
            })}
            id={props.selectListId}
            ref={props.selectListRef}
            role="listbox"
        >
            {filteredItems.length ? (
                filteredItems.map(item => (
                    <SelectListItem
                        active={item.id === active.id}
                        item={item}
                        key={item.id}
                        onSelect={props.onSelect}
                        onHover={props.onHover}
                        selected={item.id === selected.id}
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
