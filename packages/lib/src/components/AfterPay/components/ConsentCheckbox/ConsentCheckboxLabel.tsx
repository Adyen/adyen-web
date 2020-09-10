import { Fragment, h } from 'preact';
import useCoreContext from '../../../../core/Context/useCoreContext';
import getConsentLinkUrl from './getConsentLinkUrl';

interface ConsentCheckboxLabelProps {
    countryCode: string;
}

export default function ConsentCheckboxLabel(props: ConsentCheckboxLabelProps) {
    const { i18n } = useCoreContext();
    const languageCode = i18n.locale.toLowerCase().slice(0, 2);
    const linkUrl = getConsentLinkUrl(props.countryCode, languageCode);
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
