import { h } from 'preact';
import classNames from 'classnames';
import styles from '../AchInput.module.scss';
import Field from '../../../../internal/FormFields/Field';

const AchSFInput = ({ id, dataInfo, className = '', label, focused, filled, errorMessage = '', isValid = false, onFocusField }) => {
    const capitalisedId = id.charAt(0).toUpperCase() + id.slice(1);
    const encryptedIdStr = `encrypted${capitalisedId}`;

    return (
        <Field
            label={label}
            focused={focused}
            filled={filled}
            classNameModifiers={[id]}
            onFocusField={() => onFocusField(encryptedIdStr)}
            errorMessage={errorMessage}
            isValid={isValid}
            className={className}
        >
            <span
                data-cse={encryptedIdStr}
                data-info={dataInfo}
                className={classNames({
                    'adyen-checkout__input': true,
                    'adyen-checkout__input--large': true,
                    [styles['adyen-checkout__input']]: true,
                    'adyen-checkout__input--error': errorMessage.length,
                    'adyen-checkout__input--focus': focused,
                    'adyen-checkout__input--valid': isValid
                })}
            />
        </Field>
    );
};

export default AchSFInput;
