import { Fragment, h } from 'preact';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { AFTERPAY_B2B_CONSENT_URL } from '../../config';

export default function ConsentCheckboxLabel() {
    const { i18n } = useCoreContext();
    const linkUrl = AFTERPAY_B2B_CONSENT_URL;
    const linkText = i18n.get('paymentConditions');
    const translationString = i18n.get('afterPay.agreement');
    const [textBeforeLink, textAfterLink] = translationString.split('%@');

    if (textBeforeLink && textAfterLink) {
        return (
            <Fragment>
                {textBeforeLink}
                <a className="adyen-checkout__link" target="_blank" rel="noopener noreferrer" href={linkUrl}>
                    {linkText}
                </a>
                {textAfterLink}
            </Fragment>
        );
    }

    return <span className="adyen-checkout__checkbox__label">{i18n.get('privacyPolicy')}</span>;
}
