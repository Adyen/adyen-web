// import locales from './locales';

// export type Locales = keyof typeof locales;
export type Locales = string;

export type CustomTranslations = {
    [key: string]: {
        [message: string]: string;
    };
};
