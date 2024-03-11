import { isValidHttpUrl } from './isValidURL';

describe('isValidHttpUrl', () => {
    test('https url is valid', () => {
        expect(isValidHttpUrl('https://www.adyen.com')).toEqual(true);
    });
    test('http url is not valid', () => {
        expect(isValidHttpUrl('http://www.adyen.com')).toEqual(false);
    });
    test('http url is valid when config arg is passed', () => {
        expect(isValidHttpUrl('http://www.adyen.com', true)).toEqual(true);
    });
    test('url without https is not valid', () => {
        expect(isValidHttpUrl('www.adyen.com')).toEqual(false);
    });
    test('random string is not valid', () => {
        expect(isValidHttpUrl('blahblahblah')).toEqual(false);
    });
    test('empty string is not valid', () => {
        expect(isValidHttpUrl('')).toEqual(false);
    });
    test('null is not valid', () => {
        expect(isValidHttpUrl(null)).toEqual(false);
    });
    test('undefined is not valid', () => {
        expect(isValidHttpUrl(undefined)).toEqual(false);
    });
});
