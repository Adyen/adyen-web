import { ImageOptions } from '../core/Context/Resources';
import { UseImageHookType } from '../core/Context/useImage';

/** Builds the logo URL for a non-empty issuer ID. Use `getIssuerImageUrl` when the issuer may be missing. */
export const buildIssuerImageUrl =
    (options: object, type: string, getImage: UseImageHookType) =>
    (issuer: string): string => {
        const imageOptions: ImageOptions = {
            parentFolder: `${type}/`,
            type: issuer,
            ...options
        };

        return getImage(imageOptions)(issuer);
    };

const getIssuerImageUrl =
    (options: object, type: string, getImage: UseImageHookType) =>
    (issuer: string | undefined): string | null => {
        if (!issuer) return null;

        return buildIssuerImageUrl(options, type, getImage)(issuer);
    };

export default getIssuerImageUrl;
