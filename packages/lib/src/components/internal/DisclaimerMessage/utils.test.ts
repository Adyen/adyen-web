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

    test('should leave placeholders without a matching linkText or link untouched', () => {
        expect(
            formatDisclaimerMessage({
                message: 'By continuing you accept the %{terms} of %{store}',
                linkText: ['terms and conditions'],
                link: ['https://www.adyen.com']
            })
        ).toEqual({
            message: 'By continuing you accept the %#terms and conditions%# of %{store}',
            urls: ['https://www.adyen.com']
        });
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
});
