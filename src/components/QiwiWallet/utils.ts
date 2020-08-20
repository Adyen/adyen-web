/**
 * Formats and returns the passed items, adds flag string
 * @param item - prefix
 * @returns item with added displayable name and image
 */
export const formatPrefixName = item => {
    if (!item) {
        throw new Error('No item passed');
    }

    if (!item.name || !item.id) {
        return false;
    }

    const flag = item.name.toUpperCase().replace(/./g, char => (String.fromCodePoint ? String.fromCodePoint(char.charCodeAt(0) + 127397) : ''));
    return {
        ...item,
        name: `${item.name} (${item.id})`,
        displayName: flag,
        flag
    };
};

/** Finds id in list of items, returns it on match
 * @param items - list of items
 * @param countryCode - the item to select
 * @returns item or false
 */
export const selectItem = (items, countryCode) => {
    if (items && countryCode) {
        const item = items.find(i => i.name === countryCode);
        if (item) {
            return item.id;
        }
        return false;
    }
    return false;
};
