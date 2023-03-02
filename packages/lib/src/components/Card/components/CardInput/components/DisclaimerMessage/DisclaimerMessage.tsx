import { h } from 'preact';
import { DisclaimerMsgObject } from '../../types';
import { isValidHttpUrl } from '../../../../../../utils/isValidURL';
import './DisclaimerMessage.scss';

interface DisclaimerMessageProps {
    disclaimer: DisclaimerMsgObject;
}

/* eslint-disable */
/**
 * Expects a config object with this shape:
 *  disclaimerMessage: {
 *      message: 'By continuing you accept the %{linkText} of MyStore',
 *      linkText: 'terms and conditions',
 *      link: 'https://www.adyen.com'
 *  }
 */
/* eslint-enable */
export default function DisclaimerMessage({ disclaimer }: DisclaimerMessageProps) {
    const messageIsStr = typeof disclaimer.message === 'string';
    const linkTextIsStr = typeof disclaimer.linkText === 'string';
    if (!messageIsStr || !linkTextIsStr) return null;

    const [textBeforeLink, textAfterLink] = disclaimer.message.split('%{linkText}');

    if (isValidHttpUrl(disclaimer.link)) {
        return (
            <span className="adyen-checkout-disclaimer__label">
                {textBeforeLink}
                <a className="adyen-checkout__link" target="_blank" rel="noopener noreferrer" href={disclaimer.link}>
                    {disclaimer.linkText}
                </a>
                {textAfterLink}
            </span>
        );
    }

    return null;
}
