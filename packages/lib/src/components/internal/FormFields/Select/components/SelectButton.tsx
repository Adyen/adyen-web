import { h, Fragment } from 'preact';
import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectButtonProps } from '../types';
import styles from '../Select.module.scss';
import Img from '../../../Img';

function SelectButtonElement({ filterable, toggleButtonRef, ...props }) {
    if (filterable) return <div {...props} ref={toggleButtonRef} />;

    return <button {...props} ref={toggleButtonRef} />;
}

function SelectButton(props: SelectButtonProps) {
    const { i18n } = useCoreContext();
    const { active, selected, inputText, readonly, showList } = props;

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

    return (
        <SelectButtonElement
            className={cx({
                'adyen-checkout__dropdown__button': true,
                [styles['adyen-checkout__dropdown__button']]: true,
                'adyen-checkout__dropdown__button--readonly': readonly,
                'adyen-checkout__dropdown__button--active': showList,
                [styles['adyen-checkout__dropdown__button--active']]: showList,
                'adyen-checkout__dropdown__button--invalid': props.isInvalid,
                'adyen-checkout__dropdown__button--valid': props.isValid,
                'adyen-checkout__dropdown__button--disabled': selected.disabled
            })}
            disabled={props.disabled}
            filterable={props.filterable}
            onClick={onClickHandler}
            onKeyDown={!readonly ? props.onButtonKeyDown : null}
            title={selected.name || props.placeholder}
            toggleButtonRef={props.toggleButtonRef}
            type={!props.filterable ? 'button' : null}
            aria-describedby={props.ariaDescribedBy}
            id={props.id}
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
                        className={cx('adyen-checkout__filter-input', [styles['adyen-checkout__filter-input']])}
                        onInput={props.onInput}
                        onFocus={onFocusHandler}
                        placeholder={i18n.get('select.filter.placeholder')}
                        ref={props.filterInputRef}
                        role="combobox"
                        aria-activedescendant={`listItem-${active.id}`}
                        type="text"
                        readOnly={props.readonly}
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
