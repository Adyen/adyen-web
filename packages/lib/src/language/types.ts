import { CoreConfiguration } from '../types';
import type { ILanguageService } from './LanguageService';

export type CustomTranslations = {
    [locale: string]: Translations;
};

export type Translations = {
    [translationKey: string]: string;
};

export interface LanguageOptions {
    locale: string;
    service: ILanguageService;
    customTranslations?: CustomTranslations;
    onError?: CoreConfiguration['onError'];
}
