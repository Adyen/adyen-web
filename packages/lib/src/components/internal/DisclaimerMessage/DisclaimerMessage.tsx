import { h } from 'preact';
import { isValidHttpUrl } from '../../../utils/isValidURL';
import './DisclaimerMessage.scss';
import { interpolateElement } from '../../../language/utils';
export interface DisclaimerMsgObject {
    message: string;
    linkText: string;
    link: string;
}

interface InternalDisclaimerMsgObject {
    message: string;
    urls: Array<string>;
}

function render(message: string, urls: Array<string>) {
    return (
        <span className="adyen-checkout-disclaimer__label">
            {interpolateElement(
                message,
                urls.map(url => translation => (
                    <a className="adyen-checkout__link" href={url} target="_blank" rel="noopener noreferrer">
                        {translation}
                    </a>
                ))
            )}
        </span>
    );
}
/* eslint-disable */
/**
 *  props: {
 *    message: 'By continuing you agree with the %#terms and conditions%#',
 *    urls: ['https://www.adyen.com']
 *  }
 *  String inside the '%#' token pair will be rendered as an anchor element.
 */
/* eslint-enable */
export default function DisclaimerMessage({ message, urls }: InternalDisclaimerMsgObject) {
    const messageIsStr = typeof message === 'string';
    const validUrls = urls.every(url => typeof url === 'string' && isValidHttpUrl(url));
    if (!messageIsStr || !validUrls) return null;

    return render(message, urls);
}
