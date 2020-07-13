import { FALLBACK_CONTEXT } from '../core/config';

export interface ImageOptions {
    extension?: string;
    imageFolder?: string;
    loadingContext?: string;
    name?: string;
    parentFolder?: string;
    size?: string;
    subFolder?: string;
    svgOptions?: string;
    type?: string;
}

const returnImage = ({ name, loadingContext, imageFolder = '', parentFolder = '', extension, size = '', subFolder = '' }: ImageOptions): string =>
    `${loadingContext}images/${imageFolder}${subFolder}${parentFolder}${name}${size}.${extension}`;

export const getImageUrl = ({ loadingContext = FALLBACK_CONTEXT, extension = 'svg', size = '3x', ...options }: ImageOptions): Function => (
    name: string
): string => {
    const imageOptions: ImageOptions = {
        extension,
        loadingContext,
        imageFolder: 'logos/',
        parentFolder: '',
        name,
        ...options
    };

    if (extension !== 'svg') {
        return returnImage({ size: `@${size}`, subFolder: 'small/', ...imageOptions });
    }

    return returnImage(imageOptions);
};

export default getImageUrl;
