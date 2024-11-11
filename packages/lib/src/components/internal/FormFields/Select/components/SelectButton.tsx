import { h, Fragment } from 'preact';
import cx from 'classnames';
import { SelectButtonProps } from '../types';
import Img from '../../../Img';

function SelectButtonElement({ filterable, toggleButtonRef, ...props }) {
    if (filterable) {
        // Even if passed, we can't add an id to this div since it is not allowed to associate a div with a label element
        const { id, ...strippedProps } = props;
        return <div {...strippedProps} ref={toggleButtonRef} />;
    }

    return <button id={props.id} aria-describedby={props.ariaDescribedBy} type={'button'} {...props} ref={toggleButtonRef} />;
}

function SelectButton(props: Readonly<SelectButtonProps>) {
    const { active, selected, inputText, readonly, showList, required } = props;

    // display fallback order
    const displayText = selected.selectedOptionName || selected.name || props.placeholder || '';
    // displayInputText only used for the text input for the filter
    // display the "typed" filter text when showing the dropdown,
    // hide it and show the "selected" value when collapsed
    const displayInputText = showList ? inputText : displayText;

    const setFocus = (e: Event) => {
        e.preventDefault();
        if (document.activeElement === props.filterInputRef.current) {
            if (!props.showList) {
                props.toggleList(e);
            }
        } else if (props.filterInputRef.current) props.filterInputRef.current.focus();
    };

    // 1. If readonly we ignore the click action
    // 2. If filterable we want to show the list and focus on the input
    // 3. Otherwise we just toggle the list
    const onClickHandler = readonly ? null : props.filterable ? setFocus : props.toggleList;

    const onFocusHandler = readonly ? null : props.onFocus;

    // check COWEB-1301 [Investigate] Drop-in Accessibility - ADA Compliance questions
    const currentSelectedItemId = active.id ? `listItem-${active.id}` : '';

    return (
        <SelectButtonElement
            className={cx({
                'adyen-checkout__dropdown__button': true,
                'adyen-checkout__dropdown__button--readonly': readonly,
                'adyen-checkout__dropdown__button--active': showList,
                'adyen-checkout__dropdown__button--invalid': props.isInvalid,
                'adyen-checkout__dropdown__button--valid': props.isValid,
                'adyen-checkout__dropdown__button--disabled': selected.disabled
            })}
            disabled={props.disabled}
            filterable={props.filterable}
            onClick={onClickHandler}
            onKeyDown={!readonly ? props.onButtonKeyDown : null}
            toggleButtonRef={props.toggleButtonRef}
            // Only for some dropdowns e.g. the one found in installments when it is just in the form of a single dropdown, do we want to add an id that links to a label's for attr
            // If we allow an id to be added to the buttons in CtPCardsList, for example, unit tests start failing because it seems a button with an id no longer has a name property that can be used
            // as a qualifier in findByRole
            {...(props.allowIdOnButton && props.id && { id: props.id })}
        >
            {!props.filterable ? (
                <Fragment>
                    {selected.icon && <Img className="adyen-checkout__dropdown__button__icon" src={selected.icon} alt={selected.name} />}
                    <span className="adyen-checkout__dropdown__button__text">{displayText}</span>
                    {selected.secondaryText && <span className="adyen-checkout__dropdown__button__secondary-text">{selected.secondaryText}</span>}
                </Fragment>
            ) : (
                <Fragment>
                    {!showList && selected.icon && <Img className="adyen-checkout__dropdown__button__icon" src={selected.icon} alt={selected.name} />}
                    <input
                        value={displayInputText}
                        aria-autocomplete="list"
                        aria-controls={props.selectListId}
                        aria-expanded={showList}
                        aria-owns={props.selectListId}
                        autoComplete="off"
                        className="adyen-checkout__filter-input"
                        onInput={props.onInput}
                        onFocus={onFocusHandler}
                        ref={props.filterInputRef}
                        role="combobox"
                        aria-activedescendant={currentSelectedItemId}
                        type="text"
                        readOnly={props.readonly}
                        id={props.id}
                        aria-describedby={props.ariaDescribedBy}
                        required={required}
                    />
                    {!showList && selected.secondaryText && (
                        <span className="adyen-checkout__dropdown__button__secondary-text">{selected.secondaryText}</span>
                    )}
                </Fragment>
            )}
        </SelectButtonElement>
    );
}

export default SelectButton;
