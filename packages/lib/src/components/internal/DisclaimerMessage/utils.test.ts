import { formatDisclaimerMessage, getDisclaimerMessageFromConfiguration, hasDisclaimerMessage } from './utils';

describe('formatDisclaimerMessage', () => {
    test('should replace multiple placeholders, regardless of their name, in order of appearance', () => {
        expect(
            formatDisclaimerMessage({
                message: 'By continuing you accept the %{0} of %{1} ',
                linkText: ['terms and conditions', 'MyStore'],
                link: ['https://www.adyen.com', 'https://www.mystore.tp']
            })
        ).toEqual({
            message: 'By continuing you accept the %#terms and conditions%# of %#MyStore%# ',
            urls: ['https://www.adyen.com', 'https://www.mystore.tp']
        });
    });

    test('should support the single string format', () => {
        expect(
            formatDisclaimerMessage({
                message: 'By continuing you accept the %{linkText} of MyStore',
                linkText: 'terms and conditions',
                link: 'https://www.adyen.com'
            })
        ).toEqual({
            message: 'By continuing you accept the %#terms and conditions%# of MyStore',
            urls: ['https://www.adyen.com']
        });
    });

    test('should remove placeholders without matching link configuration', () => {
        expect(
            formatDisclaimerMessage({
                message: 'By continuing you accept the %{terms} of %{store}',
                linkText: ['terms and conditions'],
                link: ['https://www.adyen.com']
            })
        ).toEqual({
            message: 'By continuing you accept the %#terms and conditions%# of ',
            urls: ['https://www.adyen.com']
        });
    });

    test('should render link text as plain text when its matching link is missing', () => {
        expect(
            formatDisclaimerMessage({
                message: 'By continuing you accept the %{terms}',
                linkText: 'terms and conditions'
            })
        ).toEqual({
            message: 'By continuing you accept the terms and conditions',
            urls: []
        });
    });

    test('should return an empty message when message is not a string', () => {
        expect(
            formatDisclaimerMessage({
                message: null,
                linkText: 'terms and conditions',
                link: 'https://www.adyen.com'
            })
        ).toEqual({ message: '', urls: [] });
    });

    test('should return the message untouched when it holds no placeholder', () => {
        expect(
            formatDisclaimerMessage({
                message: 'By continuing you accept the terms and conditions',
                linkText: ['terms and conditions'],
                link: ['https://www.adyen.com']
            })
        ).toEqual({ message: 'By continuing you accept the terms and conditions', urls: [] });
    });

    test('should support a plain-text message without link configuration', () => {
        expect(
            formatDisclaimerMessage({
                message: 'Payments are processed securely.'
            })
        ).toEqual({ message: 'Payments are processed securely.', urls: [] });
    });
});

describe('getDisclaimerMessageFromConfiguration', () => {
    test('should map all three flat keys to a DisclaimerMsgObject', () => {
        expect(
            getDisclaimerMessageFromConfiguration({
                disclaimerMessage: 'Read the %{linkText} first',
                disclaimerLinkText: 'terms',
                disclaimerLink: 'https://www.adyen.com'
            })
        ).toEqual({ message: 'Read the %{linkText} first', linkText: 'terms', link: 'https://www.adyen.com' });
    });

    test('should return undefined when configuration is missing', () => {
        expect(getDisclaimerMessageFromConfiguration()).toBeUndefined();
        expect(getDisclaimerMessageFromConfiguration(undefined)).toBeUndefined();
    });

    test('should return undefined when message is missing, blank or not a string', () => {
        expect(getDisclaimerMessageFromConfiguration({})).toBeUndefined();
        expect(getDisclaimerMessageFromConfiguration({ disclaimerMessage: '   ' })).toBeUndefined();
        expect(getDisclaimerMessageFromConfiguration({ disclaimerMessage: 123 })).toBeUndefined();
    });
});

describe('hasDisclaimerMessage', () => {
    test('should return true for a non-blank message', () => {
        expect(hasDisclaimerMessage({ message: 'A message' })).toBe(true);
    });

    test('should return false for undefined, empty or whitespace-only messages', () => {
        expect(hasDisclaimerMessage()).toBe(false);
        expect(hasDisclaimerMessage({ message: '' })).toBe(false);
        expect(hasDisclaimerMessage({ message: '   ' })).toBe(false);
    });
});
