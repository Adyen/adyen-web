import getImage, { ImageOptions } from '../../utils/get-image';
import { FALLBACK_CDN_CONTEXT, FALLBACK_CONTEXT } from '../Environment/Environment';

export class Resources {
    private readonly resourceContext: string;

    constructor(cdnContext: string = FALLBACK_CDN_CONTEXT, loadingContext: string = FALLBACK_CONTEXT) {
        this.resourceContext = cdnContext ? cdnContext : loadingContext;
    }

    getImage(props: ImageOptions) {
        return getImage({ ...props, loadingContext: this.resourceContext });
    }
}
