import { ComponentChild, h } from 'preact';
import cx from 'classnames';
import './Checkbox.scss';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';

interface CheckboxProps {
    checked?: boolean;
    classNameModifiers?: string[];
    label: string | ComponentChild;
    name?: string;
    isInvalid?: boolean;
    onChange?;
    onInput?;
    className?: string;
    value?: string;
    uniqueId?: string;
    addContextualElement?: boolean;
}

export default function Checkbox({ classNameModifiers = [], label, isInvalid, onChange, ...props }: CheckboxProps) {
    // Strip some values from props. We need to reference them but don't want to set them as attributes.
    const { uniqueId: uid, addContextualElement: hasContextualElement, ...newProps } = props;

    return (
        <label className="adyen-checkout__checkbox" htmlFor={uid}>
            <input
                id={uid}
                {...newProps}
                {...(hasContextualElement && { 'aria-describedby': `${uid}${ARIA_ERROR_SUFFIX}` })}
                className={cx([
                    'adyen-checkout__checkbox__input',
                    [props.className],
                    { 'adyen-checkout__checkbox__input--invalid': isInvalid },
                    classNameModifiers.map(m => `adyen-checkout__input--${m}`)
                ])}
                type="checkbox"
                onChange={onChange}
            />
            <span className="adyen-checkout__checkbox__label">{label}</span>
        </label>
    );
}

Checkbox.defaultProps = {
    onChange: () => {}
};
