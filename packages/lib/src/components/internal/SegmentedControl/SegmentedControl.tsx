import { h } from 'preact';
import cx from 'classnames';
import './SegmentedControl.scss';
import { stopPropagationForActionKeys } from '../Button/stopPropagationForActionKeys';

export interface SegmentedControlOption<T> {
    label: string;
    value: T;
    id: string;
    controls: string;
    htmlProps?: {};
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
            {options.map(({ label, value, controls, htmlProps }: SegmentedControlOption<T>) => (
                <button
                    disabled={disabled}
                    key={value}
                    onClick={(event: MouseEvent) => onChange(value, event)}
                    // Workaround: See ADR-2341 (docs/adr/ADR-2341-uielement-keyboard-event-propagation-workaround.md)
                    onKeyPress={stopPropagationForActionKeys}
                    onKeyDown={stopPropagationForActionKeys}
                    className={cx('adyen-checkout__segmented-control-segment', {
                        'adyen-checkout__segmented-control-segment--selected': selectedValue === value
                    })}
                    aria-controls={controls}
                    aria-expanded={selectedValue === value}
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
