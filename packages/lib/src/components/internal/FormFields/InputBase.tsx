import { h } from 'preact';
import classNames from 'classnames';
import { convertFullToHalf } from './utils';

export default function InputBase(props) {
    const { autoCorrect, classNameModifiers, isInvalid, isValid, readonly = null, spellCheck, type } = props;

    const handleInput = e => {
        e.target.value = convertFullToHalf(e.target.value);
        props.onInput(e);
    };

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
            type={type}
            className={inputClassNames}
            onInput={handleInput}
            readOnly={readonly}
            spellCheck={spellCheck}
            autoCorrect={autoCorrect}
        />
    );
}

InputBase.defaultProps = {
    type: 'text',
    classNameModifiers: []
};
