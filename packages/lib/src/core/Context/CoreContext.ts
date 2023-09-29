import { createContext } from 'preact';
import { CommonPropsTypes } from './CoreProvider';

export const CoreContext = createContext({
    i18n: null,
    loadingContext: '',
    commonProps: {} as CommonPropsTypes,
    resources: null
});
