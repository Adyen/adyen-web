import { getImageUrl, ImageOptions } from './get-image';

const getIssuerImageUrl =
    (options: object, type: string) =>
    (issuer: string): string => {
        if (!issuer) return null;

        const imageOptions: ImageOptions = {
            parentFolder: issuer ? `${type}/` : '',
            type: issuer || type,
            ...options
        };

        return getImageUrl(imageOptions)(issuer);
    };

export default getIssuerImageUrl;
