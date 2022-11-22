import { createContext } from 'preact';
import { CommonPropsTypes } from './CoreProvider';
import Language from '../../language/Language';
import { Resources } from './Resources';

export const CoreContext = createContext({
    i18n: new Language(),
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
    resources: new Resources()
});

export const CoreProvider = CoreContext.Provider;
export const CoreConsumer = CoreContext.Consumer;
