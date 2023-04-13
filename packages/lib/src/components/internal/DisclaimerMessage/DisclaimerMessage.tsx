import { h } from 'preact';
import { isValidHttpUrl } from '../../../utils/isValidURL';
import './DisclaimerMessage.scss';
import { interpolateElement } from '../../../language/utils';
export interface DisclaimerMsgObject {
    message: string;
    linkText: string;
    link: string;
}

interface DisclaimerMessageProps {
    disclaimer: DisclaimerMsgObject;
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
 * 1. Expects a config object with this shape:
 *  disclaimerMessage: {
 *      message: 'By continuing you accept the %{linkText} of MyStore',
 *      linkText: 'terms and conditions',
 *      link: 'https://www.adyen.com'
 *  }
 *
 *  2. Internal structure which contains a message and a list of urls.
 *  props: {
 *    message: 'By continuing you agree with the %#terms and conditions%#',
 *    urls: ['https://www.adyen.com']
 *  }
 *  String inside the '%#' token pair will be rendered as an anchor element.
 */
/* eslint-enable */
export default function DisclaimerMessage(props: DisclaimerMessageProps | InternalDisclaimerMsgObject) {
    if ('disclaimer' in props) {
        const { disclaimer } = props;
        const messageIsStr = typeof disclaimer.message === 'string';
        const linkTextIsStr = typeof disclaimer.linkText === 'string';
        const isValidUrl = isValidHttpUrl(disclaimer.link);
        if (!messageIsStr || !linkTextIsStr || !isValidUrl) return null;

        const message = disclaimer.message.replace('%{linkText}', `%#${disclaimer.linkText}%#`);
        return render(message, [disclaimer.link]);
    }

    const { message, urls } = props as InternalDisclaimerMsgObject;
    return render(message, urls);
}
