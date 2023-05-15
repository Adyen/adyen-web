import useCoreContext from './useCoreContext';
import { useCallback } from 'preact/hooks';
import { ImageOptions } from '../../utils/get-image';

function useImage() {
    const { resources } = useCoreContext();
    return useCallback((props: ImageOptions) => resources?.getImage(props), []);
}

export default useImage;
