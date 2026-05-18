export const camelCaseToSnakeCase = (camelCaseString: string): string => {
    return camelCaseString.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

export const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
