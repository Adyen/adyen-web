import { h, Fragment } from 'preact';
import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectButtonProps } from '../types';
import styles from '../Select.module.scss';

function SelectButton(props: SelectButtonProps) {
    const { i18n } = useCoreContext();
    const { active, readonly, showList } = props;

    if (props.filterable) {
        return (
            <div
                aria-autocomplete="list"
                aria-controls={props.selectListId}
                aria-disabled={readonly}
                aria-expanded={showList}
                aria-haspopup="listbox"
                className={cx({
                    'adyen-checkout__dropdown__button': true,
                    [styles['adyen-checkout__dropdown__button']]: true,
                    'adyen-checkout__dropdown__button--readonly': readonly,
                    'adyen-checkout__dropdown__button--active': showList,
                    [styles['adyen-checkout__dropdown__button--active']]: showList,
                    'adyen-checkout__dropdown__button--invalid': props.isInvalid
                })}
                onClick={!readonly ? props.toggleList : null}
                onKeyDown={!readonly ? props.onButtonKeyDown : null}
                ref={props.toggleButtonRef}
                role="combobox"
                tabIndex={0}
                title={active.name || props.placeholder}
            >
                {!showList ? (
                    <Fragment>{active.name || props.placeholder}</Fragment>
                ) : (
                    <input
                        className={cx('adyen-checkout__filter-input', [styles['adyen-checkout__filter-input']])}
                        onInput={props.onInput}
                        placeholder={i18n.get('select.filter.placeholder')}
                        ref={props.filterInputRef}
                        type="text"
                    />
                )}
            </div>
        );
    }

    return (
        <button
            aria-disabled={readonly}
            aria-expanded={showList}
            aria-haspopup="listbox"
            className={cx({
                'adyen-checkout__dropdown__button': true,
                [styles['adyen-checkout__dropdown__button']]: true,
                'adyen-checkout__dropdown__button--readonly': readonly,
                'adyen-checkout__dropdown__button--active': showList,
                [styles['adyen-checkout__dropdown__button--active']]: showList,
                'adyen-checkout__dropdown__button--invalid': props.isInvalid
            })}
            onClick={!readonly ? props.toggleList : null}
            onKeyDown={!readonly ? props.onButtonKeyDown : null}
            ref={props.toggleButtonRef}
            tabIndex={0}
            title={active.name || props.placeholder}
        >
            <span className="adyen-checkout__dropdown__button__text">{active.selectedOptionName || active.name || props.placeholder}</span>
            {active.icon && <img className="adyen-checkout__dropdown__button__icon" src={active.icon} alt={active.name} />}
        </button>
    );
}
export default SelectButton;
