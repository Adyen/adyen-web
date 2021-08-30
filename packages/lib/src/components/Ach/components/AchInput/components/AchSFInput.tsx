import { h } from 'preact';
import classNames from 'classnames';
import styles from '../AchInput.module.scss';
import Field from '../../../../internal/FormFields/Field';
import { DATA_ENCRYPTED_FIELD_ATTR, DATA_INFO } from '../../../../internal/SecuredFields/lib/configuration/constants';
import DataSfSpan from '../../../../Card/components/CardInput/components/DataSfSpan';

const AchSFInput = ({ id, dataInfo, className = '', label, focused, filled, errorMessage = '', isValid = false, onFocusField, dir }) => {
    const capitalisedId = id.charAt(0).toUpperCase() + id.slice(1);
    const encryptedIdStr = `encrypted${capitalisedId}`;

    const opts = { [DATA_ENCRYPTED_FIELD_ATTR]: encryptedIdStr, [DATA_INFO]: dataInfo };

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
            dir={dir}
            name={id}
        >
            <DataSfSpan
                {...opts}
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
