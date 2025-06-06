import { Fragment, h } from 'preact';
import { isValidHttpUrl } from '../../../utils/isValidURL';
import './DisclaimerMessage.scss';
import { interpolateElement } from '../../../language/utils';
import Link from '../Link';

export interface DisclaimerMsgObject {
    message: string;
    linkText: string;
    link: string;
}

interface InternalDisclaimerMsgObject {
    message: string;
    urls?: Array<string>;
}

/**
 *  props: {
 *    message: 'By continuing you agree with the %#terms and conditions%#',
 *    urls: ['https://www.adyen.com']
 *  }
 *  String inside the '%#' token pair will be rendered as an anchor element.
 */

export default function DisclaimerMessage({ message, urls = [] }: InternalDisclaimerMsgObject) {
    return (
        <span className="adyen-checkout-disclaimer__label">
            <LabelOnlyDisclaimerMessage message={message} urls={urls} />
        </span>
    );
}

export function LabelOnlyDisclaimerMessage({ message, urls }: InternalDisclaimerMsgObject) {
    const messageIsStr = typeof message === 'string';
    const validUrls = urls.every(url => typeof url === 'string' && isValidHttpUrl(url));
    if (!messageIsStr || !validUrls) return null;

    return (
        <Fragment>
            {interpolateElement(
                message,
                urls.map(
                    // for each URL in the URLs array, return a createLink function
                    url =>
                        function createLink(translation) {
                            return <Link to={url}>{translation}</Link>;
                        }
                )
            )}
        </Fragment>
    );
}
