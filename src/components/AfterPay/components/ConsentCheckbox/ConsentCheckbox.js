import { h, Fragment } from 'preact';
import getLinkUrl from './getLinkUrl';
import Field from '~/components/internal/FormFields/Field';
import Checkbox from '~/components/internal/FormFields/Checkbox';

function ConsentCheckboxLabel({ countryCode, i18n }) {
    const languageCode = i18n.locale.toLowerCase().slice(0, 2);
    const linkUrl = getLinkUrl(countryCode, languageCode);
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

export default function ConsentCheckbox({ data, errorMessage, onChange, ...props }) {
    return (
        <Field classNameModifiers={['consentCheckbox']} errorMessage={errorMessage}>
            <Checkbox
                {...props}
                name="consentCheckbox"
                classNameModifiers={['consentCheckbox']}
                onInput={onChange}
                value={data.consentCheckbox}
                label={<ConsentCheckboxLabel countryCode={props.countryCode} i18n={props.i18n} />}
            />
        </Field>
    );
}
