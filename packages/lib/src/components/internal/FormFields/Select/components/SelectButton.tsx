import { h, Fragment } from 'preact';
import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectButtonProps } from '../types';
import styles from '../Select.module.scss';
import Img from '../../../Img';

function SelectButtonElement({ filterable, toggleButtonRef, ...props }) {
    return <div {...props} ref={toggleButtonRef} />;
}

function SelectButton(props: SelectButtonProps) {
    const { i18n } = useCoreContext();
    const { active, selected, inputText, readonly, showList } = props;

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
                'adyen-checkout__dropdown__button--disabled': active.disabled
            })}
            filterable={props.filterable}
            onClick={!readonly ? props.toggleList : null}
            onKeyDown={!readonly ? props.onButtonKeyDown : null}
            //role={props.filterable ? 'button' : null}
            //tabIndex="0"
            title={selected.name || props.placeholder}
            toggleButtonRef={props.toggleButtonRef}
            //type={!props.filterable ? 'button' : null}
            aria-describedby={props.ariaDescribedBy}
            id={props.id}
        >
            {!props.filterable ? (
                <Fragment>
                    {selected.icon && <Img className="adyen-checkout__dropdown__button__icon" src={selected.icon} alt={selected.name} />}
                    <span className="adyen-checkout__dropdown__button__text">
                        {selected.selectedOptionName || selected.name || props.placeholder}
                    </span>
                    {selected.secondaryText && <span className="adyen-checkout__dropdown__button__secondary-text">{selected.secondaryText}</span>}
                </Fragment>
            ) : (
                <Fragment>
                    {!showList && selected.icon && <Img className="adyen-checkout__dropdown__button__icon" src={selected.icon} alt={selected.name} />}
                    <input
                        value={inputText}
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
                        aria-activedescendant={`listItem-${active.id}`}
                        type="text"
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
