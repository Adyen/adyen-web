import { h } from 'preact';
import cx from 'classnames';
import Img from '../../../Img';
import { SelectInputComboboxProps } from '../types';

function SelectInputCombobox({
    id,
    active,
    selected,
    inputText,
    readonly,
    showList,
    toggleButtonRef,
    toggleList,
    onButtonKeyDown,
    onInput,
    selectListId,
    isInvalid,
    isValid,
    ariaDescribedBy,
    placeholder,
    disabled,
    required,
    filterInputRef
}: Readonly<SelectInputComboboxProps>) {
    const displayText = selected.selectedOptionName || selected.name || placeholder || '';
    const displayInputText = showList ? inputText : displayText;

    const currentSelectedItemId = active.id ? `listItem-${active.id}` : '';

    const setFocus = (e: Event) => {
        e.preventDefault();
        if (document.activeElement === filterInputRef.current) {
            if (!showList) {
                toggleList(e);
            }
        } else if (filterInputRef.current) filterInputRef.current.focus();
    };

    return (
        <div
            ref={toggleButtonRef}
            className={cx({
                'adyen-checkout__dropdown__button': true,
                'adyen-checkout__dropdown__button--readonly': readonly,
                'adyen-checkout__dropdown__button--active': showList,
                'adyen-checkout__dropdown__button--invalid': isInvalid,
                'adyen-checkout__dropdown__button--valid': isValid,
                'adyen-checkout__dropdown__button--disabled': selected.disabled
            })}
            onClick={readonly ? null : setFocus}
            onKeyDown={!readonly ? onButtonKeyDown : null}
        >
            {!showList && selected.icon && <Img className="adyen-checkout__dropdown__button__icon" src={selected.icon} alt={selected.name} />}
            <input
                value={displayInputText}
                aria-autocomplete="list"
                aria-controls={selectListId}
                aria-expanded={showList}
                aria-owns={selectListId}
                autoComplete="off"
                className="adyen-checkout__filter-input"
                onInput={onInput}
                ref={filterInputRef}
                role="combobox"
                aria-activedescendant={currentSelectedItemId}
                type="text"
                readOnly={readonly}
                aria-disabled={readonly}
                id={id}
                aria-describedby={ariaDescribedBy}
                required={required}
                disabled={disabled}
            />
            {!showList && selected.secondaryText && (
                <span className="adyen-checkout__dropdown__button__secondary-text">{selected.secondaryText}</span>
            )}
        </div>
    );
}

export default SelectInputCombobox;
