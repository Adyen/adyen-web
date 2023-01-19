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
import { simulateFocusScroll } from '../utils';

function Select({
    items = [],
    className = '',
    classNameModifiers = [],
    filterable = true,
    readonly = false,
    onChange = () => {},
    selected,
    isInvalid,
    isValid,
    placeholder,
    uniqueId,
    isCollatingErrors
}: SelectProps) {
    const filterInputRef = useRef(null);
    const selectContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const selectListRef = useRef(null);
    const [textFilter, setTextFilter] = useState<string>(null);
    const [showList, setShowList] = useState<boolean>(false);
    const selectListId: string = useMemo(() => `select-${uuid()}`, []);

    const active: SelectItem = items.find(i => i.id === selected) || ({} as SelectItem);

    const [inputText, setInputText] = useState<string>();

    const [activeOption, setActiveOption] = useState<SelectItem>(active);

    const [selectedOption, setSelectedOption] = useState<SelectItem>({} as SelectItem);

    const filteredItems = items.filter(item => !textFilter || item.name.toLowerCase().includes(textFilter.toLowerCase()));

    const setNextActive = () => {
        const possibleNextIndex = filteredItems.findIndex(listItem => listItem === activeOption) + 1;
        const nextIndex = possibleNextIndex < filteredItems.length ? possibleNextIndex : 0;
        const nextItem = filteredItems[nextIndex];
        scrollToItem(nextItem);
        setActiveOption(nextItem);
    };

    const setPreviousActive = () => {
        const possibleNextIndex = filteredItems.findIndex(listItem => listItem === activeOption) - 1;
        const nextIndex = possibleNextIndex < 0 ? filteredItems.length - 1 : possibleNextIndex;
        const nextItem = filteredItems[nextIndex];
        scrollToItem(nextItem);
        setActiveOption(nextItem);
    };

    const scrollToItem = (item: SelectItem) => {
        const nextElement = selectContainerRef.current.querySelector(`#listItem-${item.id}`);
        simulateFocusScroll(nextElement);
    };

    /**
     * Closes the selectList, empties the text filter and focuses the button element
     */
    const closeList = () => {
        setTextFilter(null);
        setShowList(false);
        //if (toggleButtonRef.current) toggleButtonRef.current.focus();
    };

    const openList = () => {
        setShowList(true);
    };

    /**
     * Closes the select list and fires an onChange
     * @param e - Event
     */
    const handleSelect = (e: Event) => {
        e.preventDefault();

        // If the target is not one of the list items, select the first list item
        //const target: HTMLInputElement = selectListRef.current.contains(e.currentTarget) ? e.currentTarget : selectListRef.current.firstElementChild;
        // TODO: check the handling for data-disabled
        //if (!target.getAttribute('data-disabled')) {
        closeList();
        setSelectedOption(activeOption);
        setInputText(activeOption.name);
        setTextFilter(null);
        onChange({ target: { id: activeOption.id, name: activeOption.name } });
        //}
    };

    /**
     * Handles hovering and directions
     * @param e - Event
     */
    const handleHover = (e: Event) => {
        e.preventDefault();

        // If the target is not one of the list items, select the first list item
        const target: HTMLInputElement = selectListRef.current.contains(e.currentTarget) ? e.currentTarget : selectListRef.current.firstElementChild;

        const value = target.getAttribute('data-value');
        const item = filteredItems.find(listItem => listItem.id === value);
        setActiveOption(item);
    };

    /**
     * Handle keyDown events on the selectList button
     * Responsible for opening and closing the list
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
            if (!showList) {
                openList();
            }
            handleNavigationKeys(e);
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
            closeList();
        }
    };

    /**
     * Handles movement with navigation keys and enter
     * Navigates through the list, or select an element, or focus the filter input, or close the menu.
     * @param e - KeyDownEvent
     */
    const handleNavigationKeys = (e: KeyboardEvent) => {
        switch (e.key) {
            case keys.space:
            case keys.enter:
                handleSelect(e);
                break;
            case keys.arrowDown:
                e.preventDefault();
                setNextActive();
                break;
            case keys.arrowUp:
                e.preventDefault();
                setPreviousActive();
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
        setInputText(value);
        setTextFilter(value);
    };

    /**
     * Toggles the selectList and focuses in either the filter input or in the selectList button
     * @param e - Event
     */
    const toggleList = (e: Event) => {
        e.preventDefault();
        if (!showList) {
            setInputText(null);
            openList();
        } else {
            setInputText(selectedOption.name);
            closeList();
        }
    };

    /**
     * Focus on the input if filterable
     */
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
                inputText={inputText}
                id={uniqueId ?? null}
                active={activeOption}
                selected={selectedOption}
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
                ariaDescribedBy={!isCollatingErrors && uniqueId ? `${uniqueId}${ARIA_ERROR_SUFFIX}` : null}
            />
            <SelectList
                active={activeOption}
                filteredItems={filteredItems}
                onHover={handleHover}
                onSelect={handleSelect}
                selected={selectedOption}
                selectListId={selectListId}
                selectListRef={selectListRef}
                showList={showList}
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
