import { formatDisclaimerMessage } from './utils';

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
