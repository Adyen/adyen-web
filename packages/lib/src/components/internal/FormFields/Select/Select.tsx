import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import cx from 'classnames';
import SelectButton from './components/SelectButton';
import SelectList from './components/SelectList';
import uuid from '../../../../utils/uuid';
import { keys } from './constants';
import { SelectItem, SelectProps } from './types';
import styles from './Select.module.scss';
import './Select.scss';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';

function Select({
    items = [],
    className = '',
    classNameModifiers = [],
    filterable = true,
    readonly = false,
    onChange = () => {},
    selected,
    name,
    isInvalid,
    isValid,
    placeholder,
    uniqueId
}: SelectProps) {
    const filterInputRef = useRef(null);
    const selectContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const selectListRef = useRef(null);
    const [textFilter, setTextFilter] = useState<string>(null);
    const [showList, setShowList] = useState<boolean>(false);
    const selectListId: string = useMemo(() => `select-${uuid()}`, []);

    const active: SelectItem = items.find(i => i.id === selected) || ({} as SelectItem);

    /**
     * Closes the selectList, empties the text filter and focuses the button element
     */
    const closeList = () => {
        setTextFilter(null);
        setShowList(false);
        if (toggleButtonRef.current) toggleButtonRef.current.focus();
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
            onChange({ target: { value, name: name } });
        }
    };

    /**
     * Handle keyDown events on the selectList button
     * Opens the selectList and focuses the first element if available
     * @param e - KeyboardEvent
     */
    const handleButtonKeyDown = (e: KeyboardEvent) => {
        if (e.key === keys.enter && filterable && showList && textFilter) {
            handleSelect(e);
        } else if (e.key === keys.escape) {
            // When user has focused Select button but not yet moved into Select list - close list and keep focus on the Select Button re. a11y guidelines
            // https://w3c.github.io/aria-practices/examples/disclosure/disclosure-navigation.html
            closeList();
        } else if ([keys.arrowUp, keys.arrowDown, keys.enter].includes(e.key) || (e.key === keys.space && (!filterable || !showList))) {
            e.preventDefault();
            setShowList(true);
            if (selectListRef.current?.firstElementChild) {
                selectListRef.current.firstElementChild.focus();
            }
        } else if (e.shiftKey && e.key === keys.tab) {
            // Shift-Tab out of Select - close list re. a11y guidelines (above)
            closeList();
        } else if (e.key === keys.tab) {
            closeList();
        }
    };

    /**
     * Close the select list when clicking outside the list
     * @param e - MouseEvent
     */
    const handleClickOutside = (e: MouseEvent) => {
        // use composedPath so it can also check when inside a web component
        // if composedPath is not available fallback to e.target
        const clickIsOutside = e.composedPath
            ? !e.composedPath().includes(selectContainerRef.current)
            : !selectContainerRef.current.contains(e.target);
        if (clickIsOutside) {
            setTextFilter(null);
            setShowList(false);
        }
    };

    /**
     * Handle keyDown events on the list elements
     * Navigates through the list, or select an element, or focus the filter input, or close the menu.
     * @param e - KeyDownEvent
     */
    const handleListKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLInputElement;

        switch (e.key) {
            case keys.escape:
                e.preventDefault();
                // When user is actively navigating through list with arrow keys - close list and keep focus on the Select Button re. a11y guidelines (above)
                closeList();
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
                } else if (filterable && filterInputRef.current) {
                    filterInputRef.current.focus();
                }
                break;
            case keys.tab:
                closeList();
                break;
            default:
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
        if (showList && filterable && filterInputRef.current) {
            filterInputRef.current.focus();
        }
    }, [showList]);

    useEffect(() => {
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
                className,
                ...classNameModifiers.map(m => `adyen-checkout__dropdown--${m}`)
            ])}
            ref={selectContainerRef}
        >
            <SelectButton
                id={uniqueId ?? null}
                active={active}
                filterInputRef={filterInputRef}
                filterable={filterable}
                isInvalid={isInvalid}
                isValid={isValid}
                onButtonKeyDown={handleButtonKeyDown}
                onInput={handleTextFilter}
                placeholder={placeholder}
                readonly={readonly}
                selectListId={selectListId}
                showList={showList}
                toggleButtonRef={toggleButtonRef}
                toggleList={toggleList}
                ariaDescribedBy={uniqueId ? `${uniqueId}${ARIA_ERROR_SUFFIX}` : null}
            />
            <SelectList
                active={active}
                items={items}
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
