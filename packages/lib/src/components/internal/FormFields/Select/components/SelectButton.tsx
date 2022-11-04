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
    const { active, readonly, showList } = props;

    return (
        <SelectButtonElement
            aria-disabled={readonly}
            aria-expanded={showList}
            aria-haspopup="listbox"
            className={cx({
                'adyen-checkout__dropdown__button': true,
                [styles['adyen-checkout__dropdown__button']]: true,
                'adyen-checkout__dropdown__button--readonly': readonly,
                'adyen-checkout__dropdown__button--active': showList,
                [styles['adyen-checkout__dropdown__button--active']]: showList,
                'adyen-checkout__dropdown__button--invalid': props.isInvalid,
                'adyen-checkout__dropdown__button--valid': props.isValid,
                'adyen-checkout__dropdown__button--disabled': active.disabled
            })}
            filterable={props.filterable}
            onClick={!readonly ? props.toggleList : null}
            onKeyDown={!readonly ? props.onButtonKeyDown : null}
            role={props.filterable ? 'button' : null}
            tabIndex="0"
            title={active.name || props.placeholder}
            toggleButtonRef={props.toggleButtonRef}
            type={!props.filterable ? 'button' : null}
            aria-describedby={props.ariaDescribedBy}
            id={props.id}
        >
            {!showList || !props.filterable ? (
                <Fragment>
                    {active.icon && <Img className="adyen-checkout__dropdown__button__icon" src={active.icon} alt={active.name} />}
                    <span className="adyen-checkout__dropdown__button__text">{active.selectedOptionName || active.name || props.placeholder}</span>
                    {active.secondaryText && <span className="adyen-checkout__dropdown__button__secondary-text">{active.secondaryText}</span>}
                </Fragment>
            ) : (
                <input
                    aria-autocomplete="list"
                    aria-controls={props.selectListId}
                    aria-expanded={showList}
                    aria-owns={props.selectListId}
                    autoComplete="off"
                    className={cx('adyen-checkout__filter-input', [styles['adyen-checkout__filter-input']])}
                    onInput={props.onInput}
                    placeholder={i18n.get('select.filter.placeholder')}
                    ref={props.filterInputRef}
                    role="combobox"
                    type="text"
                />
            )}
        </SelectButtonElement>
    );
}
export default SelectButton;
