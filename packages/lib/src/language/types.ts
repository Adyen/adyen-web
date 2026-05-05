import { CoreConfiguration } from '../types';
import type { ILanguageService } from './LanguageService';

export type CustomTranslations = {
    [locale: string]: Translations;
};

export type Translations = {
    [translationKey: string]: string;
};

export interface LanguageOptions {
    service: ILanguageService;
    locale?: string;
    customTranslations?: CustomTranslations;
    onError?: CoreConfiguration['onError'];
}
