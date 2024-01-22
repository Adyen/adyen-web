export const camelCaseToSnakeCase = camelCaseString => {
    return camelCaseString.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};
