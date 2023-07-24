import useCoreContext from './useCoreContext';
import { useCallback } from 'preact/hooks';
import { GetImageFnType, ImageOptions } from './Resources';

export type UseImageHookType = (props: ImageOptions) => GetImageFnType;
function useImage(): (props: ImageOptions) => GetImageFnType {
    const { resources } = useCoreContext();
    return useCallback((props: ImageOptions) => resources?.getImage(props), []);
}

export default useImage;
