export const getSearchParameter = (parameter: string, queryString = window.location.search): string | null => {
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(parameter);
};

export const getSearchParameters = (queryString = window.location.search): Record<string, string> => {
    const urlParams = new URLSearchParams(queryString);
    const parameters: Record<string, string> = {};

    // @ts-ignore "entries()" works with current setup and does not have to be changed
    for (const entry of urlParams.entries()) {
        parameters[entry[0]] = entry[1];
    }
    return parameters;
};
