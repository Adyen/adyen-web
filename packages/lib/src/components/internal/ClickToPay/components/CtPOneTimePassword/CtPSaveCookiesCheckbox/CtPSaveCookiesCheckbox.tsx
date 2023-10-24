import { h, Fragment } from 'preact';
import Field from '../../../../FormFields/Field';
import Checkbox from '../../../../FormFields/Checkbox';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { useCallback } from 'preact/hooks';
import useClickToPayContext from '../../../context/useClickToPayContext';
import './CtPSaveCookiesCheckbox.scss';

function CtPSaveCookiesCheckbox() {
    const { i18n } = useCoreContext();
    const { updateStoreCookiesConsent } = useClickToPayContext();

    const handleOnChange = useCallback(event => {
        const { checked } = event.target;
        updateStoreCookiesConsent(checked);
    }, []);

    return (
        <Fragment>
            <Field
                className="adyen-checkout-ctp__otp-checkbox-container"
                name={'click-to-pay-cookies-checkbox'}
                addContextualElement={false}
                useLabelElement={false}
                i18n={i18n}
            >
                <Checkbox name={'click-to-pay-cookies-checkbox'} onInput={handleOnChange} label={i18n.get('ctp.otp.saveCookiesCheckbox')} />
            </Field>

            <p className="adyen-checkout-ctp__otp-checkbox-info">{i18n.get('ctp.otp.saveCookiesCheckbox.info')}</p>
        </Fragment>
    );
}

export default CtPSaveCookiesCheckbox;
