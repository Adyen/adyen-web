const getFlagEmoji = (countryCode: string) =>
    countryCode.toUpperCase().replace(/./g, char => (String.fromCodePoint ? String.fromCodePoint(char.charCodeAt(0) + 127397) : ''));

export { getFlagEmoji };
