import { createContext } from 'preact';
import { CommonPropsTypes } from './CoreProvider';
import { Resources } from './Resources';
import Language from '../../language';

export const CoreContext = createContext({
    i18n: process.env.NODE_ENV === 'test' ? new Language('en-US') : null,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
    resources: new Resources()
});
