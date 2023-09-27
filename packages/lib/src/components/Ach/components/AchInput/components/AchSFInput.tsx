import { h } from 'preact';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import DataSfSpan from '../../../../Card/components/CardInput/components/DataSfSpan';
import { alternativeLabelContent } from '../../../../Card/components/CardInput/components/IframeLabelAlternative';

const AchSFInput = ({ id, dataInfo, className = '', label, focused, filled, errorMessage = '', isValid = false, onFocusField, dir }) => {
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
            dir={dir}
            name={id}
            contextVisibleToScreenReader={false}
            useLabelElement={false}
            renderAlternativeToLabel={alternativeLabelContent}
        >
            <DataSfSpan
                encryptedFieldType={encryptedIdStr}
                data-info={dataInfo}
                className={classNames({
                    'adyen-checkout__input': true,
                    'adyen-checkout__input--large': true,
                    'adyen-checkout__input--error': errorMessage.length,
                    'adyen-checkout__input--focus': focused,
                    'adyen-checkout__input--valid': isValid
                })}
            />
        </Field>
    );
};

export default AchSFInput;
