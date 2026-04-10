import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import cx from 'classnames';
import SelectTriggerButton from './components/SelectTriggerButton';
import SelectList from './components/SelectList';
import uuid from '../../../../utils/uuid';
import { keys } from './constants';
import { SelectItem, SelectProps } from './types';
import { ARIA_CONTEXT_SUFFIX, ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
import { simulateFocusScroll } from '../utils';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

function SelectOnly({
    items = [],
    className = '',
    classNameModifiers = [],
    readonly = false,
    onChange = () => {},
    selectedValue,
    name,
    isInvalid,
    isValid,
    placeholder,
    uniqueId,
    disabled,
    onListToggle,
    required
}: Readonly<SelectProps>) {
    const { i18n } = useCoreContext();
    const selectContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const selectListRef = useRef(null);
    const [showList, setShowList] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>(null);
    const selectListId: string = useMemo(() => `select-${uuid()}`, []);

    const active: SelectItem = items.find(i => i.id === selectedValue) || ({} as SelectItem);
    const [activeOption, setActiveOption] = useState<SelectItem>(active);
    const selectedOption = active;

    const suffix = isInvalid ? ARIA_ERROR_SUFFIX : ARIA_CONTEXT_SUFFIX;
    const ariaDescribedBy = uniqueId ? `${uniqueId}${suffix}` : null;

    const setNextActive = () => {
        if (!items || items.length < 1) return;
        const possibleNextIndex = items.findIndex(listItem => listItem === activeOption) + 1;
        const nextIndex = possibleNextIndex < items.length ? possibleNextIndex : 0;
        const nextItem = items[nextIndex];
        scrollToItem(nextItem);
        setActiveOption(nextItem);
    };

    const setPreviousActive = () => {
        if (!items || items.length < 1) return;
        const possibleNextIndex = items.findIndex(listItem => listItem === activeOption) - 1;
        const nextIndex = possibleNextIndex < 0 ? items.length - 1 : possibleNextIndex;
        const nextItem = items[nextIndex];
        scrollToItem(nextItem);
        setActiveOption(nextItem);
    };

    const scrollToItem = (item: SelectItem) => {
        if (!item) return;
        const nextElement = document.getElementById(`listItem-${item.id}`);
        simulateFocusScroll(nextElement);
    };

    /**
     * Closes the selectList and focuses the button element
     */
    const closeList = () => {
        setShowList(false);
    };

    const openList = () => {
        setShowList(true);
    };

    const extractItemFromEvent = (e: Event): SelectItem => {
        const value = (e.currentTarget as HTMLInputElement).getAttribute('data-value');
        return items.find(listItem => listItem.id == value);
    };

    /**
     * Closes the select list and fires an onChange
     * @param e - Event
     */
    const handleSelect = (e: Event) => {
        e.preventDefault();

        // We use a local variable here since writing and if statement is cleaner then a long ternary
        let valueToEmit;

        if (e.currentTarget instanceof HTMLElement && e.currentTarget.getAttribute('role') === 'option') {
            // This is the main scenario when clicking and item in the list
            // Item comes from the event
            valueToEmit = extractItemFromEvent(e);
        } else if (activeOption.id && items.some(item => item.id === activeOption.id)) {
            // This is the scenario where a user is using the keyboard to navigate
            // In the case item comes from the visually select item
            valueToEmit = activeOption;
        } else {
            // This will happen when we want to keep an already chosen option
            // If no active option we should just emit again with the value that was already selected
            valueToEmit = { id: selectedValue };
        }

        if (valueToEmit && !valueToEmit.disabled) {
            onChange({ target: { value: valueToEmit.id, name: name } });
            closeList();
        }
    };

    /**
     * Handles hovering and directions
     * @param e - Event
     */
    const handleHover = (e: Event) => {
        e.preventDefault();
        const item = extractItemFromEvent(e);
        setActiveOption(item);
    };

    /**
     * Handles movement with navigation keys and enter
     * Navigates through the list, or select an element, or close the menu.
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
     * Handle keyDown events on the selectList button
     * Responsible for opening and closing the list
     * @param e - KeyboardEvent
     */
    const handleButtonKeyDown = (e: KeyboardEvent) => {
        if (e.key === keys.escape) {
            // When user has focused Select button but not yet moved into Select list - close list and keep focus on the Select Button re. a11y guidelines
            // https://w3c.github.io/aria-practices/examples/disclosure/disclosure-navigation.html
            closeList();
        } else if ([keys.arrowUp, keys.arrowDown, keys.enter, keys.space].includes(e.key)) {
            e.preventDefault();
            if (!showList) {
                openList();
            } else {
                handleNavigationKeys(e);
            }
        } else if (e.shiftKey && e.key === keys.tab) {
            // Shift-Tab out of Select - close list re. a11y guidelines (above)
            closeList();
        } else if (e.key === keys.tab) {
            closeList();
        }
    };

    /**
     * Toggles the selectList
     * @param e - Event
     */
    const toggleList = (e: Event) => {
        e.preventDefault();
        if (!showList) {
            openList();
        } else {
            closeList();
        }
    };

    useEffect(() => {
        onListToggle?.(showList);
    }, [showList]);

    useEffect(() => {
        /**
         * Close the select list when clicking outside the list
         * @param e - MouseEvent
         */
        function handleClickOutside(e: MouseEvent) {
            // use composedPath so it can also check when inside a web component
            // if composedPath is not available fallback to e.target
            const clickIsOutside = e.composedPath
                ? !e.composedPath().includes(selectContainerRef.current)
                : !selectContainerRef.current.contains(e.target);
            if (clickIsOutside) {
                closeList();
            }
        }

        document.addEventListener('click', handleClickOutside, false);

        return () => {
            document.removeEventListener('click', handleClickOutside, false);
        };
    }, [selectContainerRef]);

    /**
     * Update status message for screen readers when no options are found
     */
    useEffect(() => {
        if (showList && items.length === 0) {
            setStatusMessage(i18n.get('select.noOptionsFound'));
        } else {
            setStatusMessage(null);
        }
    }, [showList, items.length, i18n]);

    return (
        <div
            className={cx(['adyen-checkout__dropdown', className, ...classNameModifiers.map(m => `adyen-checkout__dropdown--${m}`)])}
            ref={selectContainerRef}
        >
            <SelectTriggerButton
                inputText={null}
                id={uniqueId ?? null}
                active={activeOption}
                selected={selectedOption}
                filterInputRef={null}
                filterable={false}
                isInvalid={isInvalid}
                isValid={isValid}
                onButtonKeyDown={handleButtonKeyDown}
                onInput={null}
                placeholder={placeholder}
                readonly={readonly}
                selectListId={selectListId}
                showList={showList}
                toggleButtonRef={toggleButtonRef}
                toggleList={toggleList}
                disabled={disabled}
                ariaDescribedBy={ariaDescribedBy}
                required={required}
            />
            <SelectList
                active={activeOption}
                filteredItems={items}
                onHover={handleHover}
                onSelect={handleSelect}
                selected={selectedOption}
                selectListId={selectListId}
                selectListRef={selectListRef}
                showList={showList}
            />
            <div
                role="status"
                aria-live="polite"
                // aria-relevant seems to be needed here make make sure a second time we get
                // "No options found" we still announce the status message.
                // What happens otherwise is that just the first status message is announced
                // tested on VoiceOver on Chrome
                aria-relevant="all"
                className="adyen-checkout-sr-panel--sr-only"
            >
                {statusMessage}
            </div>
        </div>
    );
}

export default SelectOnly;
