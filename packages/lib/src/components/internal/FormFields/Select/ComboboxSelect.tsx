import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import cx from 'classnames';
import SelectInputCombobox from './components/SelectInputCombobox';
import SelectList from './components/SelectList';
import { keys } from './constants';
import { SelectProps } from './types';
import useSelectBase from './useSelectBase';

function ComboboxSelect({
    items = [],
    className = '',
    classNameModifiers = [],
    readonly = false,
    onChange = () => {},
    onInput,
    selectedValue,
    name,
    isInvalid,
    isValid,
    placeholder,
    uniqueId,
    disabled,
    disableTextFilter,
    clearOnSelect,
    blurOnClose,
    onListToggle,
    required
}: Readonly<SelectProps>) {
    const filterInputRef = useRef(null);
    const [textFilter, setTextFilter] = useState<string>(null);
    const [inputText, setInputText] = useState<string>();

    const filteredItems = disableTextFilter ? items : items.filter(item => !textFilter || item.name.toLowerCase().includes(textFilter.toLowerCase()));

    const {
        selectContainerRef,
        toggleButtonRef,
        selectListRef,
        showList,
        setShowList,
        statusMessage,
        selectListId,
        activeOption,
        selectedOption,
        ariaDescribedBy,
        openList,
        extractItemFromEvent,
        handleHover,
        handleNavigationKeys
    } = useSelectBase({ items: filteredItems, selectedValue, isInvalid, uniqueId, onListToggle });

    /**
     * Closes the selectList, empties the text filter and focuses the button element
     */
    const closeList = () => {
        //blurs the field when the list is closed, makes for a better UX for most users, needs more testing
        blurOnClose && filterInputRef.current.blur();
        setShowList(false);
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
            valueToEmit = extractItemFromEvent(e, filteredItems);
        } else if (activeOption.id && filteredItems.some(item => item.id === activeOption.id)) {
            // This is the scenario where a user is using the keyboard to navigate
            // In the case item comes from the visually select item
            valueToEmit = activeOption;
        } else {
            // This is the scenario the user didn't select anything
            if (textFilter) {
                // if we filtering for something then select the first option
                valueToEmit = filteredItems[0];
            } else {
                // This will happen when we want to keep an already chosen option
                // If no active option we should just emit again with the value that was already selected
                valueToEmit = { id: selectedValue };
            }
        }

        if (valueToEmit && !valueToEmit.disabled) {
            onChange({ target: { value: valueToEmit.id, name: name } });

            if (clearOnSelect) setInputText(null);

            closeList();
        }
    };

    /**
     * Handle keyDown events on the selectList button
     * Responsible for opening and closing the list
     * @param e - KeyboardEvent
     */
    const handleButtonKeyDown = (e: KeyboardEvent) => {
        if (e.key === keys.enter && showList && textFilter) {
            handleSelect(e);
        } else if (e.key === keys.escape) {
            // When user has focused Select button but not yet moved into Select list - close list and keep focus on the Select Button re. a11y guidelines
            // https://w3c.github.io/aria-practices/examples/disclosure/disclosure-navigation.html
            closeList();
        } else if ([keys.arrowUp, keys.arrowDown, keys.enter].includes(e.key) || (e.key === keys.space && !showList)) {
            e.preventDefault();
            if (!showList) {
                openList();
            } else {
                handleNavigationKeys(e, filteredItems, handleSelect);
            }
        } else if (e.shiftKey && e.key === keys.tab) {
            // Shift-Tab out of Select - close list re. a11y guidelines (above)
            closeList();
        } else if (e.key === keys.tab) {
            closeList();
        }
    };

    /**
     * Updates the state with the current text filter value and opens the dropdown
     * @param e - KeyboardEvent
     */
    const handleTextFilter = (e: KeyboardEvent) => {
        const value: string = (e.target as HTMLInputElement).value;
        setInputText(value);
        setTextFilter(value);

        // Open the dropdown when user starts typing
        if (!showList) {
            openList();
        }

        if (onInput) {
            onInput(value);
        }
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

    useEffect(() => {
        if (showList) {
            setInputText(null);
        } else {
            setTextFilter(null);
        }
    }, [showList]);

    /**
     * Focus on the input if filterable
     */
    useEffect(() => {
        if (showList && filterInputRef.current) {
            filterInputRef.current.focus();
        }
    }, [showList]);

    return (
        <div
            className={cx(['adyen-checkout__dropdown', className, ...classNameModifiers.map(m => `adyen-checkout__dropdown--${m}`)])}
            ref={selectContainerRef}
        >
            <SelectInputCombobox
                inputText={inputText}
                id={uniqueId ?? null}
                active={activeOption}
                selected={selectedOption}
                filterInputRef={filterInputRef}
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
                disabled={disabled}
                ariaDescribedBy={ariaDescribedBy}
                required={required}
            />
            <SelectList
                active={activeOption}
                filteredItems={filteredItems}
                onHover={e => handleHover(filteredItems, e)}
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

export default ComboboxSelect;
