import { h } from 'preact';
import cx from 'classnames';
import './SegmentedControl.scss';

export interface SegmentedControlOption<T> {
    label: string;
    value: T;
    htmlProps: {
        id: string;
        'aria-expanded': boolean;
        'aria-controls': string;
    };
}
export type SegmentedControlOptions<T> = Array<SegmentedControlOption<T>>;

export interface SegmentedControlProps<T> {
    classNameModifiers?: string[];
    selectedValue: T;
    disabled?: boolean;
    options: SegmentedControlOptions<T>;
    onChange(value: T, event: MouseEvent): void;
}

/**
 *
 * example:
 * <SegmentedControl
 *   onChange={(value) = setMode(value)}
 *   selectedValue={mode}
 *   disabled={status === 'loading'}
 *   classNameModifiers={['css-class']}
 *   options={segmentedControlOptions}
 * />
 *
 * @param classNameModifiers
 * @param selectedValue
 * @param disabled
 * @param options
 * @param onChange
 * @constructor
 */
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
