import { Fragment, h } from 'preact';
import classnames from 'classnames';
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
    const [isTextTruncated, setIsTextTruncated] = useState<boolean>(true);

    const handleOnChange = useCallback(() => {
        const newChecked = !checked;
        setIsChecked(newChecked);
        updateStoreCookiesConsent(newChecked);
    }, [updateStoreCookiesConsent, setIsChecked, checked]);

    return (
        <div
            className={classnames('adyen-checkout-ctp__otp-checkbox-container', {
                'adyen-checkout-ctp__otp-checkbox-container--checked': checked
            })}
        >
            <Field name={'clickToPayCookiesCheckbox'} addContextualElement={false} useLabelElement={false} i18n={i18n}>
                <Checkbox
                    name={'clickToPayCookiesCheckbox'}
                    onInput={handleOnChange}
                    label={i18n.get('ctp.otp.saveCookiesCheckbox.label')}
                    checked={checked}
                    aria-describedby={'adyen-ctp-cookies-info'}
                />
            </Field>

            <p className="adyen-checkout-ctp__otp-checkbox-info">
                {isTextTruncated ? (
                    <Fragment>
                        <span id="adyen-ctp-cookies-info">{i18n.get('ctp.otp.saveCookiesCheckbox.shorterInfo')} </span>
                        <button className="adyen-checkout-ctp__otp-readmore-button" onClick={() => setIsTextTruncated(false)}>
                            {i18n.get('readMore')}..
                        </button>
                    </Fragment>
                ) : (
                    <span id="adyen-ctp-cookies-info">{i18n.get('ctp.otp.saveCookiesCheckbox.information')}</span>
                )}
            </p>
        </div>
    );
}

export default CtPSaveCookiesCheckbox;
