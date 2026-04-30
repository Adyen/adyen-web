import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import cx from 'classnames';
import SelectListItem from './SelectListItem';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { SelectListProps } from '../types';

function SelectList({ selected, active, filteredItems, showList, ...props }: Readonly<SelectListProps>) {
    const { i18n } = useCoreContext();
    const [shouldAnnounce, setShouldAnnounce] = useState(false);

    useEffect(() => {
        if (showList && filteredItems.length === 0) {
            setShouldAnnounce(false);
            const timer = setTimeout(() => setShouldAnnounce(true), 500);
            return () => clearTimeout(timer);
        } else {
            setShouldAnnounce(false);
        }
    }, [showList, filteredItems.length]);

    return (
        <Fragment>
            {showList && filteredItems.length === 0 && (
                <p
                    role="alert"
                    aria-hidden={!shouldAnnounce}
                    className="adyen-checkout__dropdown__element adyen-checkout__dropdown__element--no-options"
                >
                    {i18n.get('select.noOptionsFound')}
                </p>
            )}
            {/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */}
            <ul
                className={cx({
                    'adyen-checkout__dropdown__list': true,
                    'adyen-checkout__dropdown__list--active': showList
                })}
                id={props.selectListId}
                ref={props.selectListRef}
                role="listbox"
            >
                {filteredItems.map(item => (
                    <SelectListItem
                        active={item.id === active.id}
                        item={item}
                        key={item.id}
                        onSelect={props.onSelect}
                        onHover={props.onHover}
                        selected={item.id === selected.id}
                    />
                ))}
            </ul>
        </Fragment>
    );
}

export default SelectList;
