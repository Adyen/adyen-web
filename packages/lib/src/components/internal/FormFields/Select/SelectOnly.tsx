import { h } from 'preact';
import cx from 'classnames';
import SelectTriggerButton from './components/SelectTriggerButton';
import SelectList from './components/SelectList';
import { keys } from './constants';
import { SelectProps } from './types';
import useSelectBase from './useSelectBase';

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
    } = useSelectBase({ items, selectedValue, isInvalid, uniqueId, onListToggle });

    const closeList = () => {
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
            valueToEmit = extractItemFromEvent(e, items);
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
                handleNavigationKeys(e, items, handleSelect);
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

    return (
        <div
            className={cx(['adyen-checkout__dropdown', className, ...classNameModifiers.map(m => `adyen-checkout__dropdown--${m}`)])}
            ref={selectContainerRef}
        >
            <SelectTriggerButton
                id={uniqueId ?? null}
                selected={selectedOption}
                isInvalid={isInvalid}
                isValid={isValid}
                onButtonKeyDown={handleButtonKeyDown}
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
                onHover={e => handleHover(items, e)}
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
