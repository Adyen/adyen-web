import getIssuerImage, { buildIssuerImageUrl } from './get-issuer-image';
import { Resources } from '../core/Context/Resources';

describe('Get issuer image', () => {
    describe('getIssuerImage', () => {
        const issuer = '123';
        const type = 'ideal';
        const loadingContext = 'http://adyen.com/';
        const options = { loadingContext };

        const getImage = props => new Resources(loadingContext).getImage(props);

        test('Prepares options when there is an issuer ID', () => {
            expect(getIssuerImage(options, 'ideal', getImage)(issuer)).toBe('http://adyen.com/images/logos/ideal/123.svg');
            expect(getIssuerImage(options, 'test', getImage)(issuer)).toBe('http://adyen.com/images/logos/test/123.svg');
        });

        test('Prepares options when there is no issuer ID', () => {
            expect(getIssuerImage(options, type, getImage)('')).toBeUndefined();
        });

        test('should return undefined without calling getImage when the issuer is undefined', () => {
            const getImageMock = jest.fn();

            expect(getIssuerImage(options, type, getImageMock)(undefined)).toBeUndefined();
            expect(getImageMock).toHaveBeenCalledTimes(0);
        });
    });

    describe('buildIssuerImageUrl', () => {
        const loadingContext = 'http://adyen.com/';
        const resources = new Resources(loadingContext);
        const getImage = resources.getImage.bind(resources);

        test('should build the same url as getIssuerImage for an issuer ID', () => {
            const options = { loadingContext };

            expect(buildIssuerImageUrl(options, 'ideal', getImage)('123')).toBe(getIssuerImage(options, 'ideal', getImage)('123'));
            expect(buildIssuerImageUrl({}, 'paybybank', getImage)('US-1')).toBe('http://adyen.com/images/logos/paybybank/US-1.svg');
        });
    });
});
