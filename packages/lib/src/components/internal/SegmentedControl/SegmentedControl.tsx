import { h } from 'preact';
import cx from 'classnames';
import './SegmentedControl.scss';

/**
 * It makes no sense of the aria tags to be responsibility of another component
 * The new interface makes it clear that id and control are required
 * While moving the expanded logic to within the SegmentedController
 * Both interfaces are compatible
 */
export interface OldSegmentedControlOption<T> {
    label: string;
    value: T;
    htmlProps: {
        id: string;
        'aria-expanded': boolean;
        'aria-controls': string;
    };
}

export interface NewSegmentedControlOption<T> {
    label: string;
    value: T;
    id: string;
    controls: string;
    htmlProps?: {};
}

type SegmentedControlOption<T> = NewSegmentedControlOption<T> | OldSegmentedControlOption<T>;

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
            {options.map(({ label, value, controls, htmlProps }: NewSegmentedControlOption<T>) => (
                <button
                    disabled={disabled}
                    key={value}
                    onClick={(event: MouseEvent) => onChange(value, event)}
                    className={cx('adyen-checkout__segmented-control-segment', {
                        'adyen-checkout__segmented-control-segment--selected': selectedValue === value
                    })}
                    aria-controls={controls}
                    aria-expanded={selectedValue === value}
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
