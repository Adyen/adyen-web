export type CustomTranslations = {
    [locale: string]: Translations;
};

export type Translations = {
    [translationKey: string]: string;
};

export interface LanguageOptions {
    locale: string;
    translations: Translations;
    customTranslations?: CustomTranslations;
}
