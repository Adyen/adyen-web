export const isValidHttpUrl = (string, allowHttp = false) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return allowHttp ? url.protocol === 'http:' || url.protocol === 'https:' : url.protocol === 'https:';
};
