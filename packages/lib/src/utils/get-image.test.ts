import { Resources } from '../core/Context/Resources';

describe('Ideal utils', () => {
    describe('getImageUrl', () => {
        const issuer = 123;
        const loadingContext = 'http://adyen.com/';
        const type = 'ideal';
        const resources = new Resources(loadingContext);
        const getImageUrl = props => resources.getImage(props);

        test('Gets a full url with a parentContext', () => {
            const options = {
                loadingContext,
                parentFolder: 'ideal/'
            };
            expect(getImageUrl(options)(issuer)).toBe('http://adyen.com/images/logos/ideal/123.svg');
        });

        test('Gets an image under components/ folder', () => {
            const options = {
                loadingContext,
                imageFolder: 'components/'
            };
            expect(getImageUrl(options)('success')).toBe('http://adyen.com/images/components/success.svg');
        });

        test('Gets a full url without a parentContext (default ideal image)', () => {
            const options = {
                loadingContext,
                parentFolder: ''
            };
            expect(getImageUrl(options)(type)).toBe('http://adyen.com/images/logos/ideal.svg');
        });

        test('Gets an image in PNG', () => {
            const options = {
                loadingContext,
                parentFolder: 'ideal/',
                extension: 'png'
            };

            expect(getImageUrl(options)(issuer)).toBe('http://adyen.com/images/logos/ideal/123.png');
        });
    });
});
