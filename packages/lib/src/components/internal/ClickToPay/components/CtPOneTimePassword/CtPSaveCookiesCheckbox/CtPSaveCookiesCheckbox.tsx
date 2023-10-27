import { h, Fragment } from 'preact';
import Field from '../../../../FormFields/Field';
import Checkbox from '../../../../FormFields/Checkbox';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { useState, useCallback } from 'preact/hooks';
import useClickToPayContext from '../../../context/useClickToPayContext';
import './CtPSaveCookiesCheckbox.scss';

function CtPSaveCookiesCheckbox() {
    const { i18n } = useCoreContext();
    const { updateStoreCookiesConsent, isStoringCookies } = useClickToPayContext();
    const [checked, setIsChecked] = useState(isStoringCookies);

    const handleOnChange = useCallback(() => {
        const newChecked = !checked;
        setIsChecked(newChecked);
        updateStoreCookiesConsent(newChecked);
    }, [updateStoreCookiesConsent, setIsChecked, checked]);

    return (
        <Fragment>
            <Field
                className="adyen-checkout-ctp__otp-checkbox-container"
                name={'clickToPayCookiesCheckbox'}
                addContextualElement={false}
                useLabelElement={false}
                i18n={i18n}
            >
                <Checkbox
                    name={'clickToPayCookiesCheckbox'}
                    onInput={handleOnChange}
                    label={i18n.get('ctp.otp.saveCookiesCheckbox')}
                    checked={checked}
                />
            </Field>

            <p className="adyen-checkout-ctp__otp-checkbox-info">{i18n.get('ctp.otp.saveCookiesCheckbox.info')}</p>
        </Fragment>
    );
}

export default CtPSaveCookiesCheckbox;
