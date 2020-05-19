import { h } from 'preact';
import classNames from 'classnames';

export default function InputBase(props) {
    const { isInvalid, isValid, classNameModifiers, readonly, spellCheck, type, validation } = props;

    const inputClassNames = classNames(
        'adyen-checkout__input',
        [`adyen-checkout__input--${type}`],
        props.className,
        {
            'adyen-checkout__input--invalid': isInvalid,
            'adyen-checkout__input--valid': isValid
        },
        classNameModifiers.map(m => `adyen-checkout__input--${m}`)
    );

    return (
        <input
            {...props}
            {...validation}
            type={type}
            className={inputClassNames}
            readOnly={readonly || null}
            spellCheck={spellCheck}
            autoCorrect={spellCheck}
        />
    );
}

InputBase.defaultProps = {
    type: 'text',
    className: '',
    classNameModifiers: [],
    validation: {}
};
