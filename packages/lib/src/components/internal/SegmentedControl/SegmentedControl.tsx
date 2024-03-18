import { h } from 'preact';
import cx from 'classnames';
import './SegmentedControl.scss';

export interface SegmentedControlProps<T> {
    classNameModifiers?: string[];
    selectedValue: T;
    disabled?: boolean;
    options: Array<{ label: string; value: T; htmlProps?: any }>;
    onChange(value: T, event: MouseEvent): void;
}

function SegmentedControl<T>({ classNameModifiers = [], selectedValue, disabled = false, options, onChange }: SegmentedControlProps<T>) {
    if (!options || options.length === 0) {
        return null;
    }

    return (
        <div
            className={cx(
                'adyen-checkout__segmented-control',
                { 'adyen-checkout__segmented-control--disabled': disabled },
                ...classNameModifiers.map(modifier => `adyen-checkout__segmented-control--${modifier}`)
            )}
            role="group"
        >
            {options.map(({ label, value, htmlProps }) => (
                <button
                    disabled={disabled}
                    key={value}
                    onClick={(event: MouseEvent) => onChange(value, event)}
                    className={cx('adyen-checkout__segmented-control-segment', {
                        'adyen-checkout__segmented-control-segment--selected': selectedValue === value
                    })}
                    type="button"
                    {...htmlProps}
                >
                    {selectedValue === value && <span className="adyen-checkout-checkmark"></span>}
                    {label}
                </button>
            ))}
        </div>
    );
}

export default SegmentedControl;
