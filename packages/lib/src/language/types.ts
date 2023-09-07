export type CustomTranslations = {
    [key: string]: {
        [message: string]: string;
    };
};

export type Locale = {
    countryLanguageCode: string;
    translations: {
        [message: string]: string;
    };
};
