import { createContext } from 'preact';
import Language from '../../language/Language';

export const CoreContext = createContext({ i18n: new Language(), loadingContext: '' });
