/**
 * Formats and returns the passed items, adds flag string
 * @param {object} item - prefix
 * @param {string} item.name - displayable name
 * @param {string} item.id - id required to be passed to back-end
 * @returns {object} item with added displayable name and image
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
        name: `${flag} ${item.name} (${item.id})`
    };
};

/** Finds id in list of items, returns it on match
 * @param {array} items - list of items
 * @param {string} countryCode - the item to select
 * @returns {string || boolean } - item or false
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
