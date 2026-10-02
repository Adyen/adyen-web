import { ImageOptions } from '../core/Context/Resources';
import { UseImageHookType } from '../core/Context/useImage';

const getIssuerImageUrl =
    (options: object, type: string, getImage: UseImageHookType) =>
    (issuer: string | undefined): string | undefined => {
        if (!issuer) return undefined;

        const imageOptions: ImageOptions = {
            parentFolder: `${type}/`,
            type: issuer,
            ...options
        };

        return getImage(imageOptions)(issuer);
    };

export default getIssuerImageUrl;
