import type { DisclaimerMessageProps, DisclaimerMsgObject } from './DisclaimerMessage';

/**
 * Matches a `%{placeholder}` link slot. Placeholder names are irrelevant, only their order matters.
 */
const LINK_SLOT_REGEX = /%\{[^}]*\}/g;

const toArray = <T>(value: T | Array<T>): Array<T> => (Array.isArray(value) ? value : [value]);

/**
 * Converts the merchant facing disclaimer message config into the props of the DisclaimerMessage component.
 *
 * Each `%{placeholder}` in the message is replaced, in order of appearance, by the corresponding entry of
 * `linkText` wrapped in the `%#` token pair that DisclaimerMessage renders as an anchor element. Slots left
 * without a linkText or a link are kept as they are, so the message degrades to plain text.
 *
 * @param disclaimerMessage - merchant provided disclaimer message
 * @returns the message with interpolation tokens and the urls matching the order of the tokens
 */
export function formatDisclaimerMessage({ message, linkText, link }: DisclaimerMsgObject): DisclaimerMessageProps {
    const linkTexts = toArray(linkText);
    const links = toArray(link);
    const urls: Array<string> = [];
    let index = 0;

    const formattedMessage = message.replace(LINK_SLOT_REGEX, slot => {
        const text = linkTexts[index];
        const url = links[index];
        index++;
        if (typeof text !== 'string' || typeof url !== 'string') return slot;
        urls.push(url);
        return `%#${text}%#`;
    });

    return { message: formattedMessage, urls };
}
