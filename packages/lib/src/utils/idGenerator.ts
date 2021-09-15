let idCounter = Date.now();

export const getUniqueId = (prefix = 'field') => {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
};
