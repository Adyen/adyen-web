import { Fragment, h } from 'preact';
import { isValidHttpUrl } from '../../../utils/isValidURL';
import './DisclaimerMessage.scss';
import { interpolateElement } from '../../../language/utils';
import Link from '../Link';

export interface DisclaimerMsgObject {
    message: string;
    linkText: string | Array<string>;
    link: string | Array<string>;
}

export interface DisclaimerMessageProps {
    message: string;
    urls?: Array<string>;
}

/**
 *  props: {
 *    message: 'By continuing you agree with the %#terms and conditions%#',
 *    urls: ['https://www.adyen.com']
 *  }
 *  String inside the '%#' token pair will be rendered as an anchor element.
 *
 *  Merchant configured disclaimers use the `%{placeholder}` format instead, and must be passed
 *  through `formatDisclaimerMessage` to obtain these props.
 */

export default function DisclaimerMessage({ message, urls = [] }: Readonly<DisclaimerMessageProps>) {
    return (
        <span className="adyen-checkout-disclaimer__label">
            <LabelOnlyDisclaimerMessage message={message} urls={urls} />
        </span>
    );
}

export function LabelOnlyDisclaimerMessage({ message, urls = [] }: Readonly<DisclaimerMessageProps>) {
    const messageIsStr = typeof message === 'string';
    const validUrls = urls.every(url => typeof url === 'string' && isValidHttpUrl(url));
    if (!messageIsStr || !validUrls) return null;

    let content;
    try {
        content = interpolateElement(
            message,
            urls.map(
                // for each URL in the URLs array, return a createLink function
                url =>
                    function createLink(translation) {
                        return <Link to={url}>{translation}</Link>;
                    }
            )
        );
    } catch (e) {
        // Fall back to raw message (i.e. the translation key) if interpolation fails
        content = message;
        // Report interpolation error to console
        console.warn(e);
    }

    return <Fragment>{content}</Fragment>;
}
