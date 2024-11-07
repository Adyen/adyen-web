export function convertAdyenLocaleToFastlaneLocale(locale: string) {
    return locale.replace('-', '_').toLowerCase();
}
