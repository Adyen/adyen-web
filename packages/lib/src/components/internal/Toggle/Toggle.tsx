import { h } from 'preact';
import cx from 'classnames';
import './Toggle.scss';

interface ToggleProps {
    label?: string;
    labelPosition?: 'before' | 'after';
    checked: boolean;
    onChange?: () => void;
    disabled?: boolean;
    readonly?: boolean;
}

const Toggle = ({ label, labelPosition, checked, disabled, readonly, onChange }: ToggleProps) => {
    const conditionalClasses = cx({
        'adyen-checkout-toggle--label-first': labelPosition === 'before',
        'adyen-checkout-toggle--disabled': disabled,
        'adyen-checkout-toggle--readonly': readonly
    });

    return (
        <label className={`adyen-checkout-toggle ${conditionalClasses}`}>
            <input
                checked={checked}
                aria-label={label}
                onChange={onChange}
                aria-describedby={''}
                role="switch"
                type="checkbox"
                className="adyen-checkout-toggle__input"
            />

            <span aria-hidden={true} className="adyen-checkout-toggle__track">
                <span className="adyen-checkout-toggle__handle">
                    {checked && (
                        <svg
                            data-v-dd0561f5=""
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            className="ui-assets-icons-16"
                        >
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
                    <span className="adyen-checkout-toggle__label-text">{label}</span>
                    <span className="adyen-checkout-toggle__description"></span>
                </span>
            )}
        </label>
    );
};

export default Toggle;
