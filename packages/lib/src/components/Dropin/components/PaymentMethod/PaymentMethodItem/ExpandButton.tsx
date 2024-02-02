import classNames from 'classnames';
import { ComponentChildren, h } from 'preact';

interface ExpandButton {
    buttonId: string;
    isSelected: boolean;
    expandContentId: string;
    children: ComponentChildren;
    showRadioButton?: boolean;
}

export function ExpandButton({ buttonId, showRadioButton, isSelected, expandContentId, children }: ExpandButton) {
    return (
        // See discussion: https://github.com/w3c/aria/issues/1404
        // eslint-disable-next-line jsx-a11y/role-supports-aria-props
        <button
            className="adyen-checkout__payment-method__header__title"
            id={buttonId}
            role={'radio'}
            aria-checked={isSelected}
            aria-expanded={isSelected}
            aria-controls={expandContentId}
            type="button"
        >
            {showRadioButton && (
                <span
                    className={classNames({
                        'adyen-checkout__payment-method__radio': true,
                        'adyen-checkout__payment-method__radio--selected': isSelected
                    })}
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
}
