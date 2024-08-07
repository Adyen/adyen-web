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
                // eslint-disable-next-line react/display-name
                urls.map(url => translation => (
                    <a className="adyen-checkout-link" href={url} target="_blank" rel="noopener noreferrer">
                        {translation}
                    </a>
                ))
            )}
        </span>
    );
}

/**
 *  props: {
 *    message: 'By continuing you agree with the %#terms and conditions%#',
 *    urls: ['https://www.adyen.com']
 *  }
 *  String inside the '%#' token pair will be rendered as an anchor element.
 */

export default function DisclaimerMessage({ message, urls }: InternalDisclaimerMsgObject) {
    try {
        const messageIsStr = typeof message === 'string';
        const validUrls = urls.every(url => typeof url === 'string' && isValidHttpUrl(url));
        if (!messageIsStr || !validUrls) return null;

        return render(message, urls);
    } catch (e) {
        console.warn('Errors rendering disclaimer message');
        return null;
    }
}
