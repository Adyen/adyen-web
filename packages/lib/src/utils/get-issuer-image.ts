import { ImageOptions } from '../core/Context/Resources';
import { UseImageHookType } from '../core/Context/useImage';

/**
 * USAGE:
 * Use getIssuerImageUrl() when rendering a list of issuer logos under logos/{txVariant}/{issuer}.svg
 * For anything else, like when you just need a single, named, asset - use Resources.getImage()
 */

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
