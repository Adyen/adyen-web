import { createContext } from 'preact';
import { CommonPropsTypes } from './CoreProvider';
import { Resources } from './Resources';

export const CoreContext = createContext({
    i18n: null,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
    resources: new Resources()
});
