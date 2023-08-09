import { ImageOptions } from '../core/Context/Resources';
import { UseImageHookType } from '../core/Context/useImage';

const getIssuerImageUrl =
    (options: object, type: string, getImage: UseImageHookType) =>
    (issuer: string): string => {
        if (!issuer) return null;

        const imageOptions: ImageOptions = {
            parentFolder: issuer ? `${type}/` : '',
            type: issuer || type,
            ...options
        };

        return getImage(imageOptions)(issuer);
    };

export default getIssuerImageUrl;
