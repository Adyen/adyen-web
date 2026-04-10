import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import cx from 'classnames';
import classnames from 'classnames';
import Img from '../../../Img';
import { SelectButtonProps } from '../types';

function SelectTriggerButton({
    id,
    selected,
    readonly,
    showList,
    toggleButtonRef,
    toggleList,
    onButtonKeyDown,
    selectListId,
    isInvalid,
    isValid,
    ariaDescribedBy,
    placeholder,
    disabled
}: Readonly<SelectButtonProps>) {
    const isShowingPlaceholder = useMemo(() => {
        const displayText = selected.selectedOptionName || selected.name;
        const isValidValue = typeof displayText === 'string' && displayText.trim() !== '';
        return isValidValue !== true;
    }, [selected, placeholder]);

    const displayText = selected.selectedOptionName || selected.name || placeholder || '';

    return (
        <button
            id={id}
            ref={toggleButtonRef}
            type="button"
            className={cx({
                'adyen-checkout__dropdown__button': true,
                'adyen-checkout__dropdown__button--readonly': readonly,
                'adyen-checkout__dropdown__button--active': showList,
                'adyen-checkout__dropdown__button--invalid': isInvalid,
                'adyen-checkout__dropdown__button--valid': isValid,
                'adyen-checkout__dropdown__button--disabled': selected.disabled
            })}
            aria-haspopup="listbox"
            aria-expanded={String(showList) as 'true' | 'false'}
            aria-controls={selectListId}
            aria-disabled={readonly}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            onClick={readonly ? null : toggleList}
            onKeyDown={!readonly ? onButtonKeyDown : null}
        >
            {selected.icon && <Img className="adyen-checkout__dropdown__button__icon" src={selected.icon} alt={selected.name} />}
            <span
                className={classnames('adyen-checkout__dropdown__button__text', {
                    'adyen-checkout__dropdown__button__text-placeholder': isShowingPlaceholder
                })}
            >
                {displayText}
            </span>
            {selected.secondaryText && <span className="adyen-checkout__dropdown__button__secondary-text">{selected.secondaryText}</span>}
        </button>
    );
}

export default SelectTriggerButton;
