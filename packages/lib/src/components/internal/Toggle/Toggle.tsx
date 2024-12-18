import { h } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import cx from 'classnames';
import uuid from '../../../utils/uuid';
import './Toggle.scss';

interface ToggleProps {
    label?: string;
    labelPosition?: 'before' | 'after';
    ariaLabel?: string;
    description?: string;
    checked: boolean;
    disabled?: boolean;
    readonly?: boolean;
    onChange?(checked: boolean): void;
}

const Toggle = ({ label, labelPosition = 'after', ariaLabel, description, checked, disabled = false, readonly = false, onChange }: ToggleProps) => {
    const descriptionId = useMemo(() => (description ? `toggle-description-${uuid()}` : null), [description]);
    const computedAriaLabel = useMemo(() => ariaLabel ?? label, [ariaLabel, label]);

    const conditionalClasses = cx({
        'adyen-checkout-toggle--label-first': labelPosition === 'before',
        'adyen-checkout-toggle--disabled': disabled,
        'adyen-checkout-toggle--readonly': readonly
    });

    const onInputChange = useCallback(
        (event: Event) => {
            onChange((event.target as HTMLInputElement).checked);
        },
        [onChange]
    );

    return (
        <label className={`adyen-checkout-toggle ${conditionalClasses}`}>
            <input
                disabled={disabled}
                checked={checked}
                onChange={onInputChange}
                aria-label={computedAriaLabel}
                aria-readonly={readonly}
                aria-describedby={descriptionId}
                role="switch"
                type="checkbox"
                className="adyen-checkout-toggle__input"
            />

            <span aria-hidden={true} className="adyen-checkout-toggle__track">
                <span className="adyen-checkout-toggle__handle">
                    {checked && (
                        <svg role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
                            <path
                                fill="#00112C"
                                d="M12.0608 6.00011L11.0001 4.93945L7.00011 8.93945L5.00011 6.93945L3.93945 8.00011L7.00011 11.0608L12.0608 6.00011Z"
                            ></path>
                        </svg>
                    )}
                </span>
            </span>

            {label && (
                <span className="adyen-checkout-toggle__label-container">
                    <span className="adyen-checkout-toggle__label-text" data-testid="inner-label">
                        {label}
                    </span>
                    {description && (
                        <span data-testid="description" className="adyen-checkout-toggle__description" id={descriptionId}>
                            {description}
                        </span>
                    )}
                </span>
            )}
        </label>
    );
};

export default Toggle;
