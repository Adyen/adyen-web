import { h } from 'preact';
import cx from 'classnames';
import './SegmentedControl.scss';

interface SegmentedControlProps<T> {
    classNameModifiers?: string[];
    selectedValue: T;
    options: Array<{ label: string; value: T; htmlProps: any }>;
    onChange(value: T, event: MouseEvent): void;
}

function SegmentedControl<T>({ classNameModifiers, options, selectedValue, onChange }: SegmentedControlProps<T>) {
    if (!options || options.length === 0) {
        return null;
    }

    return (
        <div
            className={cx(
                'adyen-checkout__segmented-control',
                ...classNameModifiers.map(modifier => `adyen-checkout__segmented-control--${modifier}`)
            )}
            role="group"
        >
            {options.map(({ label, value, htmlProps }) => (
                <button
                    key={value}
                    onClick={(event: MouseEvent) => onChange(value, event)}
                    className={cx('adyen-checkout__segmented-control-segment', {
                        'adyen-checkout__segmented-control-segment--selected': selectedValue === value
                    })}
                    type="button"
                    {...htmlProps}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default SegmentedControl;
