import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import cx from 'classnames';
import SelectButton from './components/SelectButton';
import SelectList from './components/SelectList';
import uuid from '../../../../utils/uuid';
import { SelectItem, SelectProps } from './types';
import styles from './Select.module.scss';
import './Select.scss';

function Select(props: SelectProps) {
    const filterInputRef = useRef(null);
    const selectContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const selectListRef = useRef(null);
    const firstUpdate = useRef(true);
    const [textFilter, setTextFilter] = useState<string>(null);
    const [showList, setShowList] = useState<boolean>(false);
    const selectListId: string = useMemo(() => `select-${uuid()}`, []);

    const active: SelectItem = props.items.find(i => i.id === props.selected) || ({} as SelectItem);

    const keys = {
        arrowDown: 'ArrowDown',
        arrowUp: 'ArrowUp',
        enter: 'Enter',
        escape: 'Escape',
        space: ' '
    };

    /**
     * Closes the selectList, empties the text filter and focuses the button element
     */
    const closeList = () => {
        setTextFilter(null);
        setShowList(false);
        toggleButtonRef.current.focus();
    };

    /**
     * Handle keyDown events on the selectList button
     * Opens the selectList and focuses the first element if available
     * @param e - KeyboardEvent
     */
    const handleButtonKeyDown = (e: KeyboardEvent) => {
        if (e.key === keys.enter && props.filterable && showList && textFilter) {
            handleSelect(e);
        } else if ([keys.arrowUp, keys.arrowDown, keys.enter].includes(e.key) || (e.key === keys.space && (!props.filterable || !showList))) {
            e.preventDefault();
            setShowList(true);
            if (selectListRef.current?.firstElementChild) {
                selectListRef.current.firstElementChild.focus();
            }
        }
    };

    /**
     * Close the select list when clicking outside the list
     * @param e - MouseEvent
     */
    const handleClickOutside = (e: MouseEvent) => {
        if (!selectContainerRef.current.contains(e.target)) {
            setShowList(false);
        }
    };

    /**
     * Handle keyDown events on the select button
     * Navigates through the list, or select an element, or focus the filter intput, or close the menu.
     * @param e - KeyDownEvent
     */
    const handleListKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLInputElement;

        switch (e.key) {
            case keys.escape:
                e.preventDefault();
                setShowList(false);
                break;
            case keys.space:
            case keys.enter:
                handleSelect(e);
                break;
            case keys.arrowDown:
                e.preventDefault();
                if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).focus();
                break;
            case keys.arrowUp:
                e.preventDefault();
                if (target.previousElementSibling) {
                    (target.previousElementSibling as HTMLElement).focus();
                } else if (props.filterable && filterInputRef.current) {
                    filterInputRef.current.focus();
                }
                break;
            default:
        }
    };

    /**
     * Closes the select list and fires an onChange
     * @param e - Event
     */
    const handleSelect = (e: Event) => {
        e.preventDefault();

        // If the target is not one of the list items, select the first list item
        const target: HTMLInputElement = selectListRef.current.contains(e.currentTarget) ? e.currentTarget : selectListRef.current.firstElementChild;

        if (!target.getAttribute('data-disabled')) {
            closeList();
            const value = target.getAttribute('data-value');
            props.onChange({ target: { value, name: props.name } });
        }
    };

    /**
     * Updates the state with the current text filter value
     * @param e - KeyboardEvent
     */
    const handleTextFilter = (e: KeyboardEvent) => {
        const value: string = (e.target as HTMLInputElement).value;
        setTextFilter(value.toLowerCase());
    };

    /**
     * Toggles the selectList and focuses in either the filter input or in the selectList button
     * @param e - Event
     */
    const toggleList = (e: Event) => {
        e.preventDefault();
        setShowList(!showList);
    };

    useEffect(() => {
        if (firstUpdate.current) return;

        if (showList && props.filterable) {
            if (filterInputRef.current) filterInputRef.current.focus();
        } else {
            if (toggleButtonRef.current) toggleButtonRef.current.focus();
        }
    }, [showList]);

    useEffect(() => {
        firstUpdate.current = false;
        document.addEventListener('click', handleClickOutside, false);

        return () => {
            document.removeEventListener('click', handleClickOutside, false);
        };
    }, []);

    return (
        <div
            className={cx([
                'adyen-checkout__dropdown',
                styles['adyen-checkout__dropdown'],
                props.className,
                ...props.classNameModifiers.map(m => `adyen-checkout__dropdown--${m}`)
            ])}
            ref={selectContainerRef}
        >
            <SelectButton
                active={active}
                filterInputRef={filterInputRef}
                filterable={props.filterable}
                isInvalid={props.isInvalid}
                onButtonKeyDown={handleButtonKeyDown}
                onInput={handleTextFilter}
                placeholder={props.placeholder}
                readonly={props.readonly}
                selectListId={selectListId}
                showList={showList}
                toggleButtonRef={toggleButtonRef}
                toggleList={toggleList}
            />
            <SelectList
                active={active}
                items={props.items}
                onKeyDown={handleListKeyDown}
                onSelect={handleSelect}
                selectListId={selectListId}
                selectListRef={selectListRef}
                showList={showList}
                textFilter={textFilter}
            />
        </div>
    );
}

Select.defaultProps = {
    className: '',
    classNameModifiers: [],
    filterable: true,
    items: [],
    readonly: false,
    onChange: () => {}
};

export default Select;
